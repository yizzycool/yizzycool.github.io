import { cn } from '@/utils/cn';

type Props = {
  className?: string;
};

/**
 * A reusable loading skeleton component with a dynamic brand gradient flow effect.
 */
export default function GradientFlow({ className = '' }: Props) {
  return (
    <div className={cn('animate-gradient-flow bg-gradient-flow', className)} />
  );
}
