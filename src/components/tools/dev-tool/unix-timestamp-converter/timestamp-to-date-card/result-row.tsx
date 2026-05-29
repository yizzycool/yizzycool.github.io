import { cn } from '@/utils/cn';
import CopyAction from '@/components/common/action-button/copy';

type Props = {
  label: string;
  value?: string;
};

export default function ResultRow({ label, value }: Props) {
  return (
    <div
      className={cn(
        'group relative rounded-lg border border-neutral-200 p-3 dark:border-neutral-700',
        'bg-white/40 dark:bg-neutral-900/40',
        'backdrop-blur-md'
      )}
    >
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2">
        <code className="break-all font-mono text-sm leading-relaxed">
          {value || '---'}
        </code>
        <CopyAction display="label" content={value} />
      </div>
    </div>
  );
}
