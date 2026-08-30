'use client';

import { cn } from '@/utils/cn';

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: 'card' | 'input';
  label?: string;
  showHex?: boolean;
  id?: string;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

export default function ColorPicker({
  value,
  onChange,
  variant = 'input',
  label,
  showHex = true,
  id,
  className,
  inputClassName,
  ariaLabel,
  disabled = false,
}: Props) {
  const isCard = variant === 'card';

  return (
    <ColorPickerWrapper
      isCard={isCard}
      label={label}
      showHex={showHex}
      value={value}
      className={className}
    >
      <input
        id={id}
        type="color"
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={cn(
          'h-10 w-10 cursor-pointer rounded-lg bg-transparent outline-none transition-transform active:scale-95',
          disabled && 'cursor-not-allowed opacity-50',
          !isCard && className,
          inputClassName
        )}
        aria-label={ariaLabel ?? label ?? 'Color picker'}
      />
    </ColorPickerWrapper>
  );
}

type ColorPickerWrapperProps = {
  isCard: boolean;
  label?: string;
  showHex?: boolean;
  value: string;
  className?: string;
  children: React.ReactNode;
};

function ColorPickerWrapper({
  isCard,
  label,
  showHex = true,
  value,
  className,
  children,
}: ColorPickerWrapperProps) {
  if (!isCard) {
    return children;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border border-neutral-200/60 bg-neutral-50 p-3 dark:border-neutral-700/60 dark:bg-neutral-800/50',
        className
      )}
    >
      <div>
        {label && (
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </span>
        )}
        {showHex && (
          <span className="font-mono text-sm font-medium uppercase text-slate-700 dark:text-slate-200">
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
