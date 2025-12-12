import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

type Props = {
  onClick?: () => void;
  icon?: LucideIcon;
  label?: string;
  href?: string;
};

export default function GeneralLink({
  onClick = () => {},
  icon: Icon,
  label,
  href = '#',
}: Props) {
  return (
    <Link
      className={clsx(
        'block rounded-lg px-3 py-4 font-medium',
        'transition-all duration-300',
        'hover:bg-neutral-200 dark:hover:bg-neutral-800/50'
      )}
      href={href}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {!!Icon && <Icon size={20} />}
        {!!label && <span>{label}</span>}
      </div>
    </Link>
  );
}
