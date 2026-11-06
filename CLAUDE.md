# Project instructions

## Icons

Never use emoji (e.g. 🎉) for icons in UI copy or anywhere else. Always use an SVG icon instead (e.g. from `lucide-react`, already used throughout the app).

## Before every commit

Do not build after each code change. Only when committing, run lint fix then build and make sure there are no errors:

```
pnpm lint --fix && pnpm build
```

`pnpm lint --fix` auto-fixes style issues. `pnpm build` runs `tsc -b && vite build` — catches type errors and unused variables that `tsc --noEmit` misses.

## Changing saved data

Users already have data in `localStorage`. When a feature changes the shape of saved data (new, renamed or removed fields):

1. Keep old entries readable. Add the new fields as optional, keep the old ones in the type, and convert old to new in a small pure function (e.g. `solidsOf` in `src/lib/solids.ts`).
2. Write a unit test next to it (`*.test.ts`) that feeds old-shaped data through the conversion. Cover the old shape, an empty entry, and an entry that has both old and new fields.
3. Also test the edit round trip: old entry in, form seed, form output. Nothing the user saved before may be lost or hidden.
4. Run `pnpm test` before reporting done. It also runs at pre-commit.

## Adding a new page

1. **`src/types/index.ts`** — add the page name to the `Page` union type.
2. **`src/components/layout/BottomNav.tsx`** — add `{ page, icon, label }` to `homeOptions` or `progressOptions`. Add the page to `isHomeActive` or `isProgressActive` if needed.
3. **`src/screens/`** — create the screen component. Root div must use `fade-in` class and `px-4 pt-6` padding. Title: `text-2xl font-extrabold text-app-text`. Subtitle: `text-sm text-textMuted mt-1`.
4. **`src/App.tsx`** — import the screen and add it to the `pages` record.
