'use client';

import { Info } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ToolTitles, ToolUrls } from '@/data/tools';
import { ToolAbout } from '@/data/tools/about';
import _findKey from 'lodash/findKey';
import _get from 'lodash/get';

export default function AboutBlock() {
  const pathname = usePathname();

  const toolKey = _findKey(ToolUrls, (url) => url === pathname);

  if (!toolKey) return null;

  const title = _get(ToolTitles, [toolKey]);
  const about = _get(ToolAbout, [toolKey]);

  return (
    <div className="mt-20 border-t border-neutral-200 pt-12 text-left opacity-80 dark:border-neutral-700">
      <div className="mb-4 flex items-center gap-2 text-neutral-500">
        <Info size={18} />
        <h2 className="text-sm font-bold uppercase tracking-widest">
          About {title}
        </h2>
      </div>
      <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {about}
      </p>
    </div>
  );
}
