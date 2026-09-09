// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SurfaceVariants = [
  'default',
  'elevated',
  'ghost',
  'glass',
  'glow',
  'blue',
  'purple',
  'emerald',
  'amber',
  'rose',
] as const;

export type SurfaceVariant = (typeof SurfaceVariants)[number];
