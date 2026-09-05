import type { TitleProps } from './types';

import { cn } from '@/utils/cn';
import { titleBaseStyles } from './title.variants';

export function Title({ children, className = '' }: TitleProps) {
  return <h1 className={cn(titleBaseStyles, className)}>{children}</h1>;
}
