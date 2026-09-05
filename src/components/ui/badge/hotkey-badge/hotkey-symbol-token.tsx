import { ArrowBigUp, Command, CornerDownLeft } from 'lucide-react';

import type { HotkeyBadgeLayout } from './types';

type HotkeySymbolTokenProps = {
  isMac: boolean;
  symbol: string;
  layout?: HotkeyBadgeLayout;
  kbdClassName?: string;
};

export default function HotkeySymbolToken({
  isMac,
  symbol,
  layout = 'split',
  kbdClassName,
}: HotkeySymbolTokenProps) {
  const parts = symbol.split(/\s*\+\s*|\s+/).filter(Boolean);

  if (layout === 'combined' || parts.length <= 1) {
    return (
      <kbd className={kbdClassName}>
        <span className="inline-flex items-center gap-0.5">
          {parts.map((part, index) => (
            <KeyToken key={index} isMac={isMac} token={part} />
          ))}
        </span>
      </kbd>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      {parts.map((part, index) => (
        <kbd key={index} className={kbdClassName}>
          <KeyToken isMac={isMac} token={part} />
        </kbd>
      ))}
    </span>
  );
}

type KeyTokenProps = {
  isMac: boolean;
  token: string;
};

function KeyToken({ isMac, token }: KeyTokenProps) {
  const trimmed = token.trim();

  if (!trimmed || trimmed === '+') {
    return null;
  }

  const commonProps = {
    width: '1em',
    height: '1em',
    className: 'inline shrink-0',
  };

  if (trimmed === 'Mod') {
    if (isMac) {
      return <Command {...commonProps} />;
    }
    return <span className="text-[10px] font-semibold">Ctrl</span>;
  }
  if (trimmed === 'Enter') {
    return <CornerDownLeft {...commonProps} />;
  }
  if (trimmed === 'Shift') {
    return <ArrowBigUp {...commonProps} />;
  }

  return <span>{trimmed}</span>;
}
