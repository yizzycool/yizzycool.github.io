import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      className={cn(
        'block rounded-lg px-3 py-4 font-medium transition-all duration-300',
        isActive
          ? 'bg-neutral-100 font-semibold text-slate-950 dark:bg-neutral-800 dark:text-slate-50'
          : 'text-slate-600 hover:bg-neutral-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-800/30 dark:hover:text-slate-200'
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
