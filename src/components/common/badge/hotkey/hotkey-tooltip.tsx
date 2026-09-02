'use client';

import { useMemo } from 'react';

import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../../tooltip';

type HotkeyTooltipProps = {
  isMac: boolean;
  symbol: string;
  children: React.ReactElement<Record<string, unknown>>;
};

export default function HotkeyTooltip({
  isMac,
  symbol,
  children,
}: HotkeyTooltipProps) {
  const tooltip = useMemo(() => {
    if (isMac === undefined) return '';

    let hint = symbol as string;
    if (isMac) {
      hint = hint.replaceAll('Mod', 'Command');
    } else {
      hint = hint.replaceAll('Mod', 'Ctrl');
    }

    return hint;
  }, [isMac, symbol]);

  return (
    <TooltipRoot>
      <TooltipTrigger>{children}</TooltipTrigger>
      {!!tooltip && (
        <TooltipPopup
          placement="top"
          variant="dark"
          showArrow
          className="px-2 py-1 font-mono text-[11px]"
        >
          {tooltip}
        </TooltipPopup>
      )}
    </TooltipRoot>
  );
}
