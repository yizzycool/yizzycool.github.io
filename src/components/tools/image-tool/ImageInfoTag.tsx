import { cn } from '@/utils/cn';

export default function ImageInfoTag({
  title = '',
  value = '',
}: {
  title: string;
  value: string | number | null | undefined;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs shadow-lg',
        'border border-neutral-200 dark:border-neutral-700',
        'bg-white/40 dark:bg-neutral-900/40'
      )}
    >
      {!!title && <span className="opacity-60">{title}:</span>}
      {!!value && value}
    </div>
  );
}
