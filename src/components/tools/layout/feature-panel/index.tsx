'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';
import { ToolDataForFeaturePanel } from '@/data/tools';
import BuyMeACoffee from '@/components/common/buy-me-a-coffee';

type Props = {
  side?: 'featurePanel' | 'headerToolsSelector';
  onClick?: () => void;
};

export default function FeaturePanel({
  side = 'featurePanel',
  onClick = () => {},
}: Props) {
  const pathname = usePathname();

  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <aside
      className={cn(
        getFadeUpClass(),
        side === 'featurePanel' &&
          'sticky top-[101px] hidden h-[calc(100dvh_-_101px)] w-[300px] shrink-0 overflow-y-auto px-2 pb-20 pt-4 lg:block',
        side === 'headerToolsSelector' && 'py-4'
      )}
    >
      <nav aria-label="Tools list">
        <ul>
          <li>
            {/* All Tools */}
            <h2>
              <Link
                className={cn(
                  'flex items-center rounded-md p-2 font-bold',
                  'text-slate-800 dark:text-slate-300',
                  'hover:bg-sky-600/10',
                  'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500',
                  'data-[active=true]:dark:bg-sky-600/20',
                  getFadeUpClass('animate-delay-150')
                )}
                href="/tools"
                data-active={pathname === '/tools'}
                onClick={onClick}
              >
                All Tools
              </Link>
            </h2>
          </li>
          {ToolDataForFeaturePanel.map((tool) => (
            <li key={tool.name}>
              <h2
                className={cn(
                  'mt-2 p-2 font-bold text-slate-800 dark:text-slate-300',
                  getFadeUpClass('animate-delay-150')
                )}
              >
                {tool.name}
              </h2>
              <ul className="ml-2">
                {tool.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      data-active={pathname === item.href}
                      onClick={onClick}
                      className={cn(
                        'my-1 flex cursor-pointer items-center rounded-md p-2 text-sm',
                        'hover:bg-sky-600/10',
                        'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500',
                        'data-[active=true]:dark:bg-sky-600/20'
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
      {side === 'featurePanel' && (
        <div className={cn(getFadeUpClass('animate-delay-150'))}>
          <BuyMeACoffee
            linkClassName={cn('hidden lg:block my-4 w-32 max-w-full')}
          />
        </div>
      )}
    </aside>
  );
}
