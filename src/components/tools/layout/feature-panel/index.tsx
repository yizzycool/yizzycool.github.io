'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/utils/cn';
import { ToolDataForFeaturePanel } from '@/data/tools';
import BuyMeACoffee from '@/components/common/buy-me-a-coffee';

export default function FeaturePanel() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'sticky top-[68px] hidden h-[calc(100dvh_-_68px)] w-[300px] shrink-0 overflow-y-auto p-4 lg:block',
        'border-r border-neutral-400/20'
      )}
    >
      <nav aria-label="Tools list">
        <ul>
          {ToolDataForFeaturePanel.map((tool) => (
            <li key={tool.name} className="mt-6">
              <h2 className="mb-2 font-bold text-slate-800 dark:text-slate-300">
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
      <BuyMeACoffee
        linkClassName={cn('hidden lg:block my-4 w-32 max-w-full')}
      />
    </aside>
  );
}
