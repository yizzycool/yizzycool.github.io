import { cn } from '@/utils/cn';

export const dropdownMenuBaseStyles = cn(
  'z-50 min-w-[170px] rounded-xl p-1 space-y-0.5 text-xs font-semibold shadow-xl outline-none',
  'border border-neutral-200/90 bg-white/95 backdrop-blur-xl',
  'dark:border-neutral-800/90 dark:bg-neutral-900/95 dark:shadow-black/50',
  'transition duration-200 ease-out',
  'data-[closed]:scale-95 data-[closed]:opacity-0'
);

export const dropdownItemBaseStyles = cn(
  'group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left',
  'transition-colors duration-200 outline-none select-none text-xs font-medium'
);

export const getDropdownItemStyles = (
  disabled = false,
  isActive = false,
  isDanger = false
) => {
  if (disabled) {
    return 'opacity-40 cursor-not-allowed text-neutral-400 dark:text-neutral-500';
  }
  if (isDanger) {
    return cn(
      'text-red-600 dark:text-red-400',
      'data-[focus]:bg-red-50 dark:data-[focus]:bg-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/40'
    );
  }
  if (isActive) {
    return cn(
      'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 font-bold',
      'data-[focus]:bg-sky-100 dark:data-[focus]:bg-sky-900/50 hover:bg-sky-100 dark:hover:bg-sky-900/50'
    );
  }
  return cn(
    'text-neutral-700 dark:text-neutral-300',
    'data-[focus]:bg-neutral-100 dark:data-[focus]:bg-neutral-800 data-[focus]:text-neutral-900 dark:data-[focus]:text-neutral-100',
    'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
  );
};
