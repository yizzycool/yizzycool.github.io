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

function renderHeaderIcon(toolKey: string) {
  const Icon = get(ToolIcons, toolKey);
  if (!Icon) return null;
  return (
    <div className="mt-1 rounded-xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-600/20">
      <Icon size={24} />
    </div>
  );
}

export default function HeaderBlock() {
  const pathname = usePathname();

  const toolKey = get(InvertToolUrls, pathname, '');

  const title = get(ToolTitles, toolKey);
  const desc = get(ToolDescriptions, toolKey);

  return (
    <header>
      <div className="mb-2 flex items-start gap-4 text-left text-slate-900 dark:text-slate-200">
        {renderHeaderIcon(toolKey)}
        <div>
          {!!title && <h1 className="text-2xl font-bold">{title}</h1>}
          {!!desc && (
            <h2 className="mt-0.5 text-sm text-gray-500 md:text-base dark:text-slate-400">
              {desc}
            </h2>
          )}
        </div>
      </div>
    </header>
  );
}
