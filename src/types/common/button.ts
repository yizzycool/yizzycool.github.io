// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ButtonVariants = [
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
const ButtonSizes = ['xs', 'sm', 'base', 'lg', 'xl'] as const;

export type ButtonVariant = (typeof ButtonVariants)[number];

export type ButtonSize = (typeof ButtonSizes)[number];
