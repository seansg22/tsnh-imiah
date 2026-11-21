import { useEffect, useLayoutEffect, useState } from 'react';

// iPhone only: the mic grant is lost after one voice note, so the page reloads before the next one.
// These helpers carry the screen state over the reload (sessionStorage lives as long as the tab or home-screen app).
const KEY = 'reload-keep';
const live: Record<string, unknown> = {}; // values of the mounted useKeptState hooks
let kept: Record<string, unknown> = {}; // what the last reload saved, read once at load
try {
  kept = JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Record<string, unknown>;
  sessionStorage.removeItem(KEY);
} catch { /* nothing saved, or storage is blocked */ }

if ('resumed' in kept) { // no fade-in on this first paint: the page should look like it never left
  document.documentElement.classList.add('resumed');
  setTimeout(() => document.documentElement.classList.remove('resumed'), 600);
}

export const isIPhone = /iPhone/.test(navigator.userAgent);

// Like useState, but the value comes back after reloadKeeping().
export function useKeptState<T>(key: string, init: T) {
  const s = useState<T>(() => (key in kept ? (kept[key] as T) : init));
  const value = s[0];
  useEffect(() => {
    live[key] = value;
  }, [key, value]);
  useEffect(() => {
    delete kept[key]; // used once: coming back to this screen later starts fresh
    return () => { delete live[key]; }; // an unmounted screen must not be saved
  }, [key]);
  return s;
}

// Put the page scroll back after a reload. Call once from a component that mounts with the page.
export function useKeptScroll() {
  useLayoutEffect(() => { // before the first paint, so the page never shows at the top first
    const y = kept.scrollY;
    delete kept.scrollY;
    if (typeof y === 'number') window.scrollTo({ top: y, behavior: 'instant' });
  }, []);
}

export function reloadKeeping() {
  try { sessionStorage.setItem(KEY, JSON.stringify({ ...live, resumed: true, scrollY: window.scrollY })); } catch { /* reload anyway */ }
  location.reload();
}
