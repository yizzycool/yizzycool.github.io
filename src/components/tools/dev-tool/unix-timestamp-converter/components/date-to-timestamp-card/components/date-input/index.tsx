import clsx from 'clsx';

type Props = {
  label: string;
  value: number | undefined;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
};

export default function DateInput({ label, value, onChange, min, max }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          'w-full rounded-md border border-neutral-200 px-2 py-2 text-center font-mono outline-none',
          'bg-white focus:border-neutral-400',
          'dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-500'
        )}
      />
    </div>
  );
}
