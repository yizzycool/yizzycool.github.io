import clsx from 'clsx';

export default function ImageInfoTag({
  title = '',
  value = '',
}: {
  title: string;
  value: string | number | null | undefined;
}) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs text-white shadow-lg backdrop-blur-md',
        'border border-white/10',
        'bg-neutral-900/80 dark:bg-neutral-800/80'
      )}
    >
      {!!title && <span className="opacity-60">{title}:</span>}
      {!!value && value}
    </div>
  );
}
