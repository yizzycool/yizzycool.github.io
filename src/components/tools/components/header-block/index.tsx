'use client';

import { usePathname } from 'next/navigation';
import { get, invert } from 'lodash';

import {
  ToolDescriptions,
  ToolIcons,
  ToolTitles,
  ToolUrls,
} from '@/data/tools';

const InvertToolUrls = invert(ToolUrls);

export default function HeaderBlock() {
  const pathname = usePathname();

  const toolKey = get(InvertToolUrls, pathname, '');

  const Icon = get(ToolIcons, toolKey);
  const title = get(ToolTitles, toolKey);
  const desc = get(ToolDescriptions, toolKey);

  return (
    <header>
      <div className="mb-2 flex items-center gap-3">
        {!!Icon && <Icon size={24} />}
        {!!title && <h1 className="text-left text-2xl font-bold">{title}</h1>}
      </div>
      {!!desc && (
        <h2 className="mt-4 text-left text-sm text-gray-500 md:text-base dark:text-neutral-400">
          {desc}
        </h2>
      )}
    </header>
  );
}
