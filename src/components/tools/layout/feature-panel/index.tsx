'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tools } from '@/components/header/components/tools-selector';

export default function FeaturePanel() {
  const pathname = usePathname();

  return (
    <div className="sticky top-[68px] hidden h-dvh w-64 border-r-[1px] border-neutral-400/20 p-4 lg:block">
      {Tools.map((tool) => (
        <div key={tool.name} className="mt-6">
          <div className="mb-2 font-bold">{tool.name}</div>
          {tool.items.map((item) => (
            <Link
              key={item.name}
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
          ))}
        </div>
      ))}
    </div>
  );
}
