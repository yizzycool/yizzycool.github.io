// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BadgeVariants = [
  'primary',
  'secondary',
  'ghost',
  'outline',
  'error',
  'dark-sky',
  'neutral',
  'success',
  'blue',
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BadgeSizes = ['xs', 'sm', 'base', 'lg', 'xl'] as const;

export type BadgeVariant = (typeof BadgeVariants)[number];

export type BadgeSize = (typeof BadgeSizes)[number];
