import { Command, CornerDownLeft } from 'lucide-react';

export default function HotkeySymbol({ symbol }: { symbol: string }) {
  const parts = symbol.split(' ');
  if (parts.length <= 1) {
    return <KeyToken token={symbol} />;
  }
  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className="inline-flex items-center gap-0.5">
          <KeyToken token={part} />
        </span>
      ))}
    </>
  );
}

function KeyToken({ token }: { token: string }) {
  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed === '⌘') {
    return <Command className="inline h-3 w-3 shrink-0" />;
  }
  if (trimmed === '↵') {
    return <CornerDownLeft className="inline h-3 w-3 shrink-0" />;
  }
  return <span>{trimmed}</span>;
}
