import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type Props = {
  flags: string;
  setFlags: React.Dispatch<React.SetStateAction<string>>;
  inline?: boolean;
};

export const regexFlags = [
  { key: 'g', label: 'global' },
  { key: 'i', label: 'ignore case' },
  { key: 'm', label: 'multiline' },
  { key: 's', label: 'dotAll' },
  { key: 'u', label: 'unicode' },
  { key: 'y', label: 'sticky' },
];

export default function FlagSelector({
  flags,
  setFlags,
  inline = false,
}: Props) {
  const toggleFlag = (flag: string) => {
    if (flag === 'g') return;

    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, '') : prev + flag
    );
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center',
        inline ? 'gap-1' : 'mt-6 gap-2'
      )}
    >
      {regexFlags.map((f) => (
        <Button
          key={f.key}
          variant={flags.includes(f.key) ? 'primary' : 'ghost'}
          size="xs"
          bordered={!inline}
          rounded={inline ? 'md' : undefined}
          onClick={() => toggleFlag(f.key)}
          disabled={f.key === 'g'}
          title={`${f.key} — ${f.label}`}
          ariaLabel={`Toggle ${f.label} flag (${f.key})`}
          className={inline ? 'h-7 px-2 font-mono text-xs' : undefined}
        >
          <span className="font-bold">{f.key}</span>
          {!inline && (
            <span className="ml-1.5 hidden font-normal opacity-80 sm:inline">
              {f.label}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
