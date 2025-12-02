import { Dialog, DialogBackdrop } from '@headlessui/react';
import { LucideIcon, X } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
};

export default function GeneralDialog({
  isOpen,
  onClose,
  title = '',
  showCloseButton = true,
  icon: Icon,
  className = '',
  children,
}: Props) {
  return (
    <Dialog
      open={isOpen}
      as="div"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none sm:p-8 md:p-12"
      onClose={onClose}
      transition
    >
      {/* Backdrop */}
      <DialogBackdrop
        className="absolute inset-0 bg-slate-200/80 backdrop-blur-md transition-opacity duration-300 dark:bg-black/80"
        onClick={onClose}
      />
      {/* Rounded Border */}
      <div
        className={clsx(
          'relative flex max-h-full w-fit max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl',
          'duration-200 animate-in fade-in zoom-in-95',
          'bg-white dark:bg-[#111]',
          'border border-slate-900/5 dark:border-white/10',
          className
        )}
      >
        <div className="flex items-center justify-end px-8 pb-4 pt-6">
          {!!Icon && <Icon size={20} className="mr-2" />}
          {!!title && (
            <h2 className="mr-4 flex-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
          )}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="-mr-2 rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {children}
      </div>
    </Dialog>
  );
}
