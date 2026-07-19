'use client';

import { cn } from '@/utils/cn';

type SwitchProps = {
  /**
   * Whether the switch is toggled on.
   */
  checked: boolean;
  /**
   * Callback function triggered when the state changes.
   */
  onChange: (checked: boolean) => void;
  /**
   * Optional text label displayed next to the switch.
   */
  label?: string;
  /**
   * Whether the switch is interactive.
   */
  disabled?: boolean;
  /**
   * Additional CSS classes for the label wrapper container.
   */
  className?: string;
  /**
   * Unique ID for the input element (for accessibility).
   */
  id?: string;
};

export default function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  id,
}: SwitchProps) {
  // Generate a fallback ID if one isn't provided
  const switchId =
    id ||
    (label ? `switch-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'inline-flex cursor-pointer select-none items-center gap-2.5 text-sm font-medium transition-colors',
        disabled ? 'cursor-not-allowed opacity-50' : '',
        className
      )}
    >
      {label && (
        <span className="text-neutral-600 transition-colors group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white">
          {label}
        </span>
      )}
      <div className="relative">
        <input
          type="checkbox"
          id={switchId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          className="peer sr-only"
        />
        {/* Track */}
        <div
          className={cn(
            'h-5 w-9 rounded-full transition-colors duration-200 ease-in-out',
            'bg-neutral-200 dark:bg-neutral-700',
            'peer-checked:bg-sky-500 dark:peer-checked:bg-sky-600'
          )}
        />
        {/* Knob */}
        <div
          className={cn(
            'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out',
            'dark:bg-neutral-100',
            'peer-checked:translate-x-4'
          )}
        />
      </div>
    </label>
  );
}
