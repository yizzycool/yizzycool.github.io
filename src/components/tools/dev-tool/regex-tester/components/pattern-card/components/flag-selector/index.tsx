import { RegexFlags } from '../../../..';
import Button from '@/components/common/button';

type Props = {
  flags: string;
  setFlags: React.Dispatch<React.SetStateAction<string>>;
};

export default function FlagSelector({ flags, setFlags }: Props) {
  const toggleFlag = (flag: string) => {
    if (flag === 'g') return;

    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, '') : prev + flag
    );
  };

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {RegexFlags.map((f) => (
        <Button
          key={f.key}
          variant={flags.includes(f.key) ? 'primary' : 'ghost'}
          size="xs"
          bordered
          onClick={() => toggleFlag(f.key)}
          disabled={f.key === 'g'}
        >
          <span className="font-bold">{f.key}</span>
          <span className="ml-1.5 hidden font-normal opacity-80 sm:inline">
            {f.label}
          </span>
        </Button>
      ))}
    </div>
  );
}
