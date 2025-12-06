import { WebDetectionFileType } from '../result-canvas';
import Button from '@/components/common/button';

type Props = {
  tab: WebDetectionFileType;
  setTab: React.Dispatch<React.SetStateAction<WebDetectionFileType>>;
};

const TabList: Array<WebDetectionFileType> = ['image', 'video', 'webcam'];

export default function Tabs({ tab, setTab }: Props) {
  return (
    <div className="flex">
      {TabList.map((mode) => (
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
