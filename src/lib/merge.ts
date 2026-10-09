// Three-way merge of localStorage snapshots (base = last synced, local, cloud).
// Generic over key shape: arrays merge by item identity, objects merge per field,
// anything else is a true conflict and local wins.
// ponytail: no per-field timestamps, so a same-field edit on both sides resolves to local.

const ORDER_FIELDS = ['timestamp', 'date', 'createdAt'];

const canon = (v: unknown): string =>
  JSON.stringify(v, (_, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b)))
      : x,
  ) ?? 'undefined';

const eq = (a: unknown, b: unknown) => canon(a) === canon(b);
const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

const idOf = (item: unknown) =>
  isObj(item) && 'id' in item ? `id:${String(item.id)}` : `v:${canon(item)}`;

function sortChronologically(items: unknown[]): unknown[] {
  const field = ORDER_FIELDS.find(f => items.every(i => isObj(i) && i[f] !== undefined));
  if (!field) return items;
  const get = (i: unknown) => (i as Record<string, number | string>)[field];
  return [...items].sort((a, b) => (get(a) < get(b) ? -1 : get(a) > get(b) ? 1 : 0));
}

function mergeArray(base: unknown[], local: unknown[], cloud: unknown[]): unknown[] {
  const index = (arr: unknown[]) => new Map(arr.map(i => [idOf(i), i]));
  const B = index(base), L = index(local), C = index(cloud);
  const out: unknown[] = [];
  for (const id of new Set([...C.keys(), ...L.keys()])) {
    const inB = B.has(id), b = B.get(id), l = L.get(id), c = C.get(id);
    if (L.has(id) && C.has(id)) out.push(mergeValue(b, l, c));
    else if (L.has(id)) { if (!(inB && eq(l, b))) out.push(l); } // unchanged here + deleted in cloud => drop
    else if (!(inB && eq(c, b))) out.push(c);                    // unchanged there + deleted here => drop
  }
  return sortChronologically(out);
}

function mergeValue(base: unknown, local: unknown, cloud: unknown): unknown {
  if (eq(local, cloud)) return local;
  if (eq(local, base)) return cloud;
  if (eq(cloud, base)) return local;
  if (local === undefined) return cloud; // deleted here, edited there: the edit wins
  if (cloud === undefined) return local;
  if (Array.isArray(local) && Array.isArray(cloud)) {
    return mergeArray(Array.isArray(base) ? base : [], local, cloud);
  }
  if (isObj(local) && isObj(cloud)) {
    const b = isObj(base) ? base : {};
    const out: Record<string, unknown> = {};
    for (const k of new Set([...Object.keys(local), ...Object.keys(cloud)])) {
      const v = mergeValue(b[k], local[k], cloud[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  return local;
}

function mergeString(base?: string, local?: string, cloud?: string): string | undefined {
  if (local === cloud) return local;
  if (local === base) return cloud;
  if (cloud === base) return local;
  if (local === undefined) return cloud;
  if (cloud === undefined) return local;
  try {
    const parse = (s?: string) => (s === undefined ? undefined : JSON.parse(s));
    return JSON.stringify(mergeValue(parse(base), parse(local), parse(cloud)));
  } catch {
    return local; // not JSON on at least one side
  }
}

export function merge(
  base: Record<string, string>,
  local: Record<string, string>,
  cloud: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of new Set([...Object.keys(local), ...Object.keys(cloud)])) {
    const v = mergeString(base[k], local[k], cloud[k]);
    if (v !== undefined) out[k] = v;
  }
  return out;
}
