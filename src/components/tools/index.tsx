'use client';

import Link from 'next/link';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';
import { Tools } from '@/data/tools';
import HeaderBlock from './components/index-header-block';
import RevealSection from '../common/reveal-section';

export default function ToolsIndex() {
  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <div className="mx-auto w-full text-left lg:max-w-[calc(1024px_-_5rem)]">
      {/* Title Header */}
      <HeaderBlock />

      {/* Tool Categories */}
      <div className="mt-12 space-y-12">
        {Tools.map((group) => (
          <RevealSection key={group.name}>
            <section className={cn('space-y-6', getFadeUpClass())}>
              <h2
                className={cn(
                  'border-b pb-2 text-xl font-bold tracking-tight text-neutral-800',
                  'border-neutral-200/60 dark:border-neutral-800/40 dark:text-neutral-200'
                )}
              >
                {group.name}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {group.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group relative flex flex-col justify-between rounded-2xl border p-5 shadow-sm backdrop-blur-sm',
                      'border-neutral-200/80 bg-white/40 dark:border-neutral-800/60 dark:bg-neutral-900/40',
                      'transition-all duration-300',
                      'hover:-translate-y-0.5 hover:bg-white hover:shadow-md',
                      'hover:border-sky-500/20 dark:hover:border-sky-500/20 dark:hover:bg-neutral-900'
                    )}
                  >
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors',
                          'bg-sky-50 text-sky-600 group-hover:bg-sky-100',
                          'dark:bg-neutral-800 dark:text-sky-600 dark:group-hover:bg-sky-900/20'
                        )}
                      >
                        <item.icon.component className="h-5 w-5" />
                      </div>
                      <div>
                        <h3
                          className={cn(
                            'text-base font-bold text-neutral-900 transition-colors',
                            'group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-600'
                          )}
                        >
                          {item.name}
                        </h3>
                        <p className="mt-1.5 text-xs font-light leading-relaxed text-neutral-500 dark:text-neutral-400">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </RevealSection>
        ))}
      </div>
    </div>
  );
}
