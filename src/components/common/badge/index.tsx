'use client';

type Props = {
  type?: 'neutral' | 'success' | 'blue';
  children?: React.ReactNode;
};

export default function Badge({ type = 'neutral', children }: Props) {
  const styles = {
    neutral:
      'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
    success:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  };
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${styles[type]}`}
    >
      {children}
    </span>
  );
}
