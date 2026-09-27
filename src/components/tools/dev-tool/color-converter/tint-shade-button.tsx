'use client';

import { Button } from '@/components/ui/button';

type TintShadeButtonProps = {
  hex: string;
  name: string;
  isCurrent?: boolean;
  onSelectColor: (hex: string) => void;
};

export default function TintShadeButton({
  hex,
  name,
  isCurrent,
  onSelectColor,
}: TintShadeButtonProps) {
  return (
    <Button
      variant="ghost"
      bordered={false}
      hoverEffect={false}
      rounded="none"
      onClick={() => onSelectColor(hex)}
      style={{ backgroundColor: hex }}
      title={`${name} (${hex})`}
      tooltipPlacement="top"
      showTooltipArrow
      ariaLabel={`Select ${name} (${hex})`}
      className="group relative flex h-12 min-w-[28px] flex-1 items-center justify-center p-0 hover:z-10"
    >
      {isCurrent && (
        <span className="shadow-xs h-2.5 w-2.5 rounded-full border border-neutral-950 bg-white ring-1 ring-white/90" />
      )}
    </Button>
  );
}
