import { ArrowBigUp, ChevronUp, Command, CornerDownLeft } from 'lucide-react';

import { HotkeySymbol } from '.';

type HotkeySymbolTokenProps = {
  isMac: boolean;
  symbol: HotkeySymbol;
};

export default function HotkeySymbolToken({
  isMac,
  symbol,
}: HotkeySymbolTokenProps) {
  const parts = symbol.split(' ');
  if (parts.length <= 1) {
    return <KeyToken isMac={isMac} token={symbol} />;
  }
  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className="inline-flex items-center">
          <KeyToken isMac={isMac} token={part} />
        </span>
      ))}
    </>
  );
}

type KeyTokenProps = {
  isMac: boolean;
  token: string;
};

function KeyToken({ isMac, token }: KeyTokenProps) {
  const trimmed = token.trim();

  if (!trimmed) {
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
    return <ChevronUp {...commonProps} />;
  }
  if (trimmed === 'Enter') {
    return <CornerDownLeft {...commonProps} />;
  }
  if (trimmed === 'Shift') {
    return <ArrowBigUp {...commonProps} />;
  }

  return <span>{trimmed}</span>;
}
