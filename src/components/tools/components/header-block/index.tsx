'use client';

import { usePathname } from 'next/navigation';
import {
  ToolDescriptions,
  ToolIcons,
  ToolTitles,
  ToolUrls,
} from '@/data/tools';
import _get from 'lodash/get';
import _invert from 'lodash/invert';

const InvertToolUrls = _invert(ToolUrls);

export default function HeaderBlock() {
  const pathname = usePathname();

  const toolKey = _get(InvertToolUrls, pathname, '');

  const Icon = _get(ToolIcons, toolKey);
  const title = _get(ToolTitles, toolKey);
  const desc = _get(ToolDescriptions, toolKey);

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
