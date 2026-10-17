// en and vi must have exactly the same keys, otherwise tsc fails
export function defineStrings<const K extends string>(en: Record<K, string>, vi: Record<NoInfer<K>, string>) {
  return { en, vi };
}
