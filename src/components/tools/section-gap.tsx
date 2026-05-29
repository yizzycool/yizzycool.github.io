import { cn } from '@/utils/cn';

type Props = {
  size?: 'xs' | 'sm' | 'normal' | 'lg' | 'xl';
};

export default function SectionGap({ size = 'normal' }: Props) {
  return (
    <div
      className={cn(
        size === 'xs' && 'mt-4',
        size === 'sm' && 'mt-6 sm:mt-8',
        size === 'normal' && 'mt-8 sm:mt-12',
        size === 'lg' && 'mt-10 sm:mt-16',
        size === 'xl' && 'mt-12 sm:mt-20'
      )}
    />
  );
}
