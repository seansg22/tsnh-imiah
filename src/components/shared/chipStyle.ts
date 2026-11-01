// One look for every selectable tag/pill in the app: outlined, peach when selected, no tick.
export const chipCls = (on: boolean) =>
  `border transition-all ${on ? 'border-peach bg-peachLight text-peachDark' : 'border-peachLight bg-cream text-textMuted'}`;
