'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';
import { ToolDataForFeaturePanel } from '@/data/tools';

export default function FeaturePanel() {
  const pathname = usePathname();

  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <aside
      className={cn(
        'sticky top-[68px] hidden h-[calc(100dvh_-_68px)] w-72 overflow-y-auto p-4 lg:block',
        'border-r border-neutral-400/20',
        getFadeUpClass()
      )}
    >
      <nav aria-label="Tools list">
        <ul>
          {ToolDataForFeaturePanel.map((tool) => (
            <li key={tool.name} className="mt-6">
              <h2 className="mb-2 font-bold text-neutral-500 dark:text-neutral-300">
                {tool.name}
              </h2>
              <ul>
                {tool.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      data-active={pathname === item.href}
                      className={cn(
                        'my-1 flex cursor-pointer items-center rounded-md p-2 text-sm',
                        'hover:bg-sky-600/10',
                        'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500'
                      )}
                    >
                      <item.icon.component className="mr-4 h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
