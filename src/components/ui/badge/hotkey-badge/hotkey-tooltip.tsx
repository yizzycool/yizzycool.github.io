'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../../tooltip';

type HotkeyTooltipProps = {
  isMac: boolean;
  symbol: string;
  children: ReactNode;
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
      <TooltipTrigger>
        <span className="inline-flex items-center">{children}</span>
      </TooltipTrigger>
      {!!tooltip && (
        <TooltipPopup
          placement="top"
          variant="dark"
          showArrow
          className="px-2 py-1 text-[11px]"
        >
          {tooltip}
        </TooltipPopup>
      )}
    </TooltipRoot>
  );
}
