'use client';

import type { FeaturePanelSide } from './types';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import useToolsPreferences from '@/hooks/tools/use-tools-preferences';
import { cn } from '@/utils/cn';
import { ToolDataForFeaturePanel } from '@/data/tools';
import { BuyMeACoffee } from '@/components/shared/buy-me-a-coffee';

import FavoritesGroup from './favorites-group';
import ToolGroupAccordion from './tool-group-accordion';

type Props = {
  side?: FeaturePanelSide;
  onClick?: () => void;
};

export default function FeaturePanel({
  side = 'featurePanel',
  onClick = () => {},
}: Props) {
  const pathname = usePathname();
  const { getFadeUpClass } = useGetTransitionClass();
  const { favoriteToolKeys } = useToolsPreferences();

  const favoriteItems = useMemo(
    () =>
      ToolDataForFeaturePanel.flatMap((group) => group.items).filter((item) =>
        favoriteToolKeys.includes(item.key)
      ),
    [favoriteToolKeys]
  );

  return (
    <aside
      className={cn(
        side === 'featurePanel' && 'px-2 pb-20 pt-1',
        side === 'headerToolsSelector' && 'py-4',
        getFadeUpClass('animate-delay-150')
      )}
    >
      <nav aria-label="Tools list">
        <ul>
          <li>
            {/* All Tools */}
            <Link
              className={cn(
                'flex items-center rounded-md p-2 font-bold transition-colors',
                'text-slate-800 dark:text-slate-300',
                'hover:bg-sky-600/10',
                'data-[active=true]:bg-sky-600/10 data-[active=true]:text-sky-500',
                'data-[active=true]:dark:bg-sky-600/20'
              )}
              href="/tools"
              data-active={pathname === '/tools'}
              onClick={onClick}
            >
              All Tools
            </Link>
          </li>

          <FavoritesGroup
            items={favoriteItems}
            pathname={pathname}
            side={side}
            onClick={onClick}
          />

          {ToolDataForFeaturePanel.map((group) => (
            <ToolGroupAccordion
              key={group.id}
              group={group}
              pathname={pathname}
              side={side}
              onClick={onClick}
            />
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
