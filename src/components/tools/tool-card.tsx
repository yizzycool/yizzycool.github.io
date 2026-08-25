'use client';

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ToolItem {
  key: string;
  name: string;
  href: string;
  desc: string;
  icon: {
    component: React.ComponentType<{ className?: string }>;
  };
  badge?: string;
}

interface ToolCardProps {
  item: ToolItem;
  isFavorite: boolean;
  onToggleFavorite: (key: string) => void;
}

export default function ToolCard({
  item,
  isFavorite,
  onToggleFavorite,
}: ToolCardProps) {
  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(item.key);
  };

  return (
    <Link
      href={item.href}
      className={cn(
        'shadow-xs group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300',
        'border-slate-200/80 bg-white/50 dark:border-neutral-800 dark:bg-neutral-900/40',
        'hover:-translate-y-0.5 hover:bg-white hover:shadow-md',
        'hover:border-sky-500/50 dark:hover:border-sky-500/50 dark:hover:bg-neutral-900'
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          {/* Icon */}
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
              'bg-slate-200/50 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-600',
              'dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-sky-950/40 dark:group-hover:text-sky-500'
            )}
          >
            <item.icon.component className="h-5 w-5" />
          </div>

          {/* Actions: Favorite Star Button */}
          <button
            type="button"
            onClick={handleStarClick}
            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              isFavorite
                ? 'text-amber-400 hover:text-amber-500 dark:text-amber-400'
                : 'text-slate-300 hover:bg-slate-100 hover:text-amber-400 dark:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-amber-400'
            )}
          >
            <Star
              className={cn(
                'h-4 w-4 transition-transform group-hover/btn:scale-110',
                isFavorite && 'fill-amber-400'
              )}
            />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'text-base font-bold text-slate-900 transition-colors',
                'group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400'
              )}
            >
              {item.name}
            </h3>
            {item.badge && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                {item.badge}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs font-light leading-relaxed text-slate-500 dark:text-slate-400">
            {item.desc}
          </p>
        </div>
      </div>

      {/* Footer Arrow / Indicator */}
      <div className="mt-4 flex items-center justify-end text-xs font-medium text-slate-400 transition-colors group-hover:text-sky-600 dark:text-slate-500 dark:group-hover:text-sky-400">
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
