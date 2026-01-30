// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Roundeds = [
  'none',
  'sm',
  'base',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  'full',
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Animations = ['none', 'fade-in'] as const;

export type Rounded = (typeof Roundeds)[number];

export type Animation = (typeof Animations)[number];
