import { cn } from '@/utils/cn';

type Props = {
  label: string;
  value: number | string | undefined;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
};

export default function DateInput({ label, value, onChange, min, max }: Props) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ''}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-xl border border-neutral-200/90 px-3 py-2.5 text-center font-mono text-base outline-none transition-all',
          'bg-white/70 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/60',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20'
        )}
      />
    </div>
  );
}
