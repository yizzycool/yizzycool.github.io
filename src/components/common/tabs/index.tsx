import { useEffect, useState } from 'react';
import Button from '@/components/common/button';

type Props = {
  tabs: Array<string>;
  defaultActiveTab?: string;
  onChange?: (tab: string) => void;
};

export default function Tabs({
  tabs,
  defaultActiveTab = '',
  onChange = () => {},
}: Props) {
  const [tab, setTab] = useState(defaultActiveTab || tabs[0]);

  useEffect(() => {
    onChange(tab);
  }, [tab]);

  return (
    <div className="flex">
      {tabs.map((mode) => (
        <Button
          key={mode}
          variant="ghost"
          rounded="none"
          onClick={() => setTab(mode)}
          className={
            tab === mode
              ? 'border-b-2 border-sky-600 text-sky-600 dark:text-sky-600'
              : 'border-b-2 border-neutral-300 dark:border-neutral-600'
          }
        >
          {mode}
        </Button>
      ))}
    </div>
  );
}
