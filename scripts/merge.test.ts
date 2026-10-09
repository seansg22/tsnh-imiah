import { test } from 'node:test';
import assert from 'node:assert/strict';
import { merge } from '../src/lib/merge.ts';

const S = JSON.stringify;
const run = (b: unknown, l: unknown, c: unknown) =>
  JSON.parse(merge({ k: S(b) }, { k: S(l) }, { k: S(c) }).k);

test('add on both sides unions, sorted by date', () => {
  const b = [{ id: 'a', date: '2026-01-01' }];
  const l = [...b, { id: 'l', date: '2026-03-01' }];
  const c = [...b, { id: 'c', date: '2026-02-01' }];
  assert.deepEqual(run(b, l, c).map((x: { id: string }) => x.id), ['a', 'c', 'l']);
});

test('delete on one side is not resurrected by the other', () => {
  assert.deepEqual(run(['m1', 'm2'], ['m1'], ['m1', 'm2', 'm3']).sort(), ['m1', 'm3']);
});

test('edit vs delete: edit wins', () => {
  const b = [{ id: 'a', w: 1 }];
  assert.deepEqual(run(b, [], [{ id: 'a', w: 2 }]), [{ id: 'a', w: 2 }]);
});

test('same id edited on both sides merges per field, local wins ties', () => {
  const b = [{ id: 'a', w: 1, h: 1 }];
  const l = [{ id: 'a', w: 5, h: 1 }];
  const c = [{ id: 'a', w: 9, h: 3 }];
  assert.deepEqual(run(b, l, c), [{ id: 'a', w: 5, h: 3 }]);
});

test('profile object merges field-wise', () => {
  assert.deepEqual(
    run({ name: 'Mi', notes: 'a' }, { name: 'Mi', notes: 'b' }, { name: 'Mimi', notes: 'a' }),
    { name: 'Mimi', notes: 'b' },
  );
});

test('scalar conflict: local wins; one-sided change: that side wins', () => {
  assert.equal(run(1, 2, 3), 2);
  assert.equal(run(1, 1, 3), 3);
});

test('empty base (first sync) unions arrays; chat messages keep order', () => {
  const l = [{ role: 'user', content: 'x', timestamp: 3 }];
  const c = [{ role: 'user', content: 'y', timestamp: 1 }];
  assert.deepEqual(run(undefined, l, c).map((m: { timestamp: number }) => m.timestamp), [1, 3]);
});

test('non-JSON string and missing keys', () => {
  assert.equal(merge({ p: 'a' }, { p: 'b' }, { p: 'c' }).p, 'b');
  assert.deepEqual(merge({}, { a: '1' }, { b: '2' }), { a: '1', b: '2' });
  assert.deepEqual(merge({ a: '1' }, {}, { a: '1' }), {}); // deleted locally
});
