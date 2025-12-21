import type { ButtonVariant } from '@/types/common/button';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import Button from '@/components/common/button';

type Props = {
  tabs: Array<string>;
  tabIcons?: Array<LucideIcon>;
  defaultActiveTab?: string;
  variant?: ButtonVariant;
  className?: string;
  activeClassName?: string;
  onChange?: (tab: string) => void;
};

export default function ButtonTabs({
  tabs,
  tabIcons = [],
  defaultActiveTab = '',
  className = '',
  activeClassName = '',
  onChange = () => {},
}: Props) {
  const [tab, setTab] = useState(defaultActiveTab || tabs[0]);

  useEffect(() => {
    onChange(tab);
  }, [tab]);

  return (
    <div className="flex gap-4">
      {tabs.map((mode, idx) => (
        <Button
          key={mode}
          variant="ghost"
          bordered
          onClick={() => setTab(mode)}
          icon={tabIcons[idx]}
          className={clsx(
            className,
            tab === mode &&
              clsx(
                'text-sky-600 dark:text-sky-600',
                'border-sky-500 dark:border-sky-600',
                'bg-sky-100/50 dark:bg-sky-900/50',
                'hover:bg-sky-100/50 hover:dark:bg-sky-900/50',
                activeClassName
              )
          )}
        >
          {mode}
        </Button>
      ))}
    </div>
  );
}
