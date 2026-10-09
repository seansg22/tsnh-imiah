// Syncs localStorage to the backend as one opaque key->string snapshot.
// Auto flow = three-way merge (base = last synced snapshot, local, cloud) guarded by a server version.
import { merge } from './merge';

const API = import.meta.env.VITE_API_BASE_URL as string | undefined;
const ACCOUNT = 'sync:account';
const ENABLED = 'sync:enabled';
const AUTO = 'sync:auto';
const LAST_PUSH = 'sync:last-push';
const BASE = 'sync:base';
const MAX_ATTEMPTS = 3;

// Navigation state that must not follow the user to another device.
const LOCAL_ONLY = ['baby-day:current-page'];

export const APPLIED_EVENT = 'cloudsync:applied';

export interface Account { username: string; code: string }
type Snapshot = Record<string, string>;

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function post<T>(path: string, body: object): Promise<T> {
  if (!API) throw new Error('Cloud sync is not configured');
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError((json as { error?: string }).error ?? `Request failed (${res.status})`, res.status);
  return json as T;
}

export function getAccount(): Account | null {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT) ?? 'null') as Account | null;
  } catch {
    return null;
  }
}

export const isEnabled = () => localStorage.getItem(ENABLED) === '1';
export const enableSync = () => localStorage.setItem(ENABLED, '1');
// auto-sync is on unless the user switched it off
export const isAuto = () => localStorage.getItem(AUTO) !== '0';
export const setAuto = (on: boolean) => localStorage.setItem(AUTO, on ? '1' : '0');
export const getLastPush = () => localStorage.getItem(LAST_PUSH);

export async function register(username: string, code: string) {
  await post('/register', { username, code });
  localStorage.setItem(ACCOUNT, JSON.stringify({ username, code }));
  localStorage.removeItem(BASE);
  enableSync(); // cloud is empty, local is the source
}

export async function login(username: string, code: string) {
  await post('/login', { username, code });
  localStorage.setItem(ACCOUNT, JSON.stringify({ username, code }));
  localStorage.removeItem(BASE);
  localStorage.removeItem(ENABLED); // don't auto-sync until the user picks a direction or merges
}

export function logout() {
  [ACCOUNT, ENABLED, LAST_PUSH, BASE].forEach(k => localStorage.removeItem(k));
}

const syncKeys = () =>
  Object.keys(localStorage).filter(k => !k.startsWith('sync:') && !LOCAL_ONLY.includes(k));

function snapshot(): Snapshot {
  const data: Snapshot = {};
  for (const k of syncKeys()) data[k] = localStorage.getItem(k) ?? '';
  return data;
}

const same = (a: Snapshot, b: Snapshot) => {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(k => a[k] === b[k]);
};

function getBase(): Snapshot {
  try {
    return JSON.parse(localStorage.getItem(BASE) ?? '{}') as Snapshot;
  } catch {
    return {};
  }
}

function markSynced(base: Snapshot) {
  localStorage.setItem(BASE, JSON.stringify(base));
  localStorage.setItem(LAST_PUSH, new Date().toISOString());
  enableSync();
}

export async function fetchCloud(): Promise<{ data: Snapshot; version: number }> {
  const account = getAccount();
  if (!account) return { data: {}, version: 0 };
  return post('/sync/pull', account);
}

export const sameAsLocal = (cloud: Snapshot) => same(snapshot(), cloud);

function applyLocally(merged: Snapshot, local: Snapshot) {
  for (const k of Object.keys(local)) if (!(k in merged)) localStorage.removeItem(k);
  for (const [k, v] of Object.entries(merged)) if (local[k] !== v) localStorage.setItem(k, v);
  window.dispatchEvent(new Event(APPLIED_EVENT)); // lets React state re-read localStorage, no reload
}

// Smart sync: pull, three-way merge, push the result if it differs, apply it locally.
export async function sync() {
  const account = getAccount();
  if (!account) return;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { data: cloud, version } = await fetchCloud();
    const local = snapshot();
    const merged = merge(getBase(), local, cloud);
    if (!same(merged, cloud)) {
      try {
        await post('/sync/push', { ...account, data: merged, if_version: version });
      } catch (e) {
        if (e instanceof HttpError && e.status === 409) continue; // another device pushed first: re-merge
        throw e;
      }
    }
    if (!same(merged, local)) {
      if (!same(snapshot(), local)) return; // edited during the round-trip; retry next tick, nothing lost
      applyLocally(merged, local);
    }
    markSynced(merged);
    return;
  }
  throw new Error('Sync conflict, please try again');
}

// Explicit overwrite: cloud := this device.
export async function push() {
  const account = getAccount();
  if (!account) return;
  const data = snapshot();
  await post('/sync/push', { ...account, data }); // no if_version = force
  markSynced(data);
}

// Explicit overwrite: this device := cloud.
export async function pull() {
  const { data } = await fetchCloud();
  syncKeys().forEach(k => localStorage.removeItem(k));
  for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v);
  markSynced(data);
  window.location.reload();
}
