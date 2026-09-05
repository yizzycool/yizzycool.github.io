import type { ContentVersion } from '../../types';

import { Copy, Check } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { CountBadge, HotkeyBadge } from '@/components/ui/badge';

type FocusModalTabsProps = {
  contents: ContentVersion[];
  focusTab: number;
  isCopied: boolean;
  onSelectTab: (tabIndex: number) => void;
  onCopy: () => void;
};

export function FocusModalTabs({
  contents,
  focusTab,
  isCopied,
  onSelectTab,
  onCopy,
}: FocusModalTabsProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-between border-b bg-neutral-50/70 px-5 py-2.5 sm:px-6',
        'border-neutral-200/80 dark:border-neutral-800/80 dark:bg-neutral-900/40'
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {contents.map((version, versionIdx) => (
          <Button
            key={versionIdx}
            variant={focusTab === versionIdx ? 'blue' : 'secondary'}
            size="xs"
            rounded="lg"
            bordered
            onClick={() => onSelectTab(versionIdx)}
            className="shrink-0 gap-1.5"
          >
            <CountBadge
              count={versionIdx + 1}
              variant={focusTab === versionIdx ? 'subtle-inverted' : 'subtle'}
            />
            <span>{version.label || `Tab ${versionIdx + 1}`}</span>
          </Button>
        ))}
      </div>

      {/* Copy Button with state */}
      <Button
        variant={isCopied ? 'primary' : 'surface'}
        size="xs"
        rounded="lg"
        icon={isCopied ? Check : Copy}
        onClick={onCopy}
        className="shadow-2xs gap-1 text-xs font-semibold"
        ariaLabel="Copy version content"
      >
        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
        <HotkeyBadge symbol="Mod+C" color="ghost" bordered={false} />
      </Button>
    </div>
  );
}
