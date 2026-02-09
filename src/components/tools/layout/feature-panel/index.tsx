'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tools } from '@/data/tools';

export default function FeaturePanel() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-[68px] hidden w-72 overflow-y-auto border-r-[1px] border-neutral-400/20 p-4 lg:block"
      style={{
        height: 'calc(100dvh - 68px)',
      }}
    >
      <nav aria-label="Tools list">
        <ul>
          {Tools.map((tool) => (
            <li key={tool.name} className="mt-6">
              <h2 className="mb-2 font-bold text-neutral-500 dark:text-neutral-400">
                {tool.name}
              </h2>
              <ul>
                {tool.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      className={clsx(
                        'my-1 flex cursor-pointer items-center rounded-md p-2 text-sm',
                        'hover:bg-sky-600/10',
                        'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500'
                      )}
                      href={item.href}
                      data-active={pathname === item.href}
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
