import { LucideIcon } from 'lucide-react';
import { MouseEventHandler } from 'react';

type Props = {
  children?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  className?: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'icon' | 'lg';
  disabled?: boolean;
};

// UI Component: Button
export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  icon: Icon,
  size = 'md',
  disabled = false,
}: Props) {
  const baseStyles =
    'flex items-center justify-center rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-sm',
    secondary:
      'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
    ghost:
      'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800',
    outline:
      'border border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    icon: 'p-2',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && (
        <Icon
          size={size === 'lg' ? 20 : 16}
          className={children ? 'mr-2' : ''}
        />
      )}
      {children}
    </button>
  );
}
