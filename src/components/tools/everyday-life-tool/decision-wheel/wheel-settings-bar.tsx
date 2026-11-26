'use client';

import type { DecisionWheelPrefs, SpinSpeed, WheelPaletteId } from './types';

import { Ban, Gauge, Palette, Trophy, Volume2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';

import { SPIN_SPEED_LABELS, WHEEL_PALETTES } from './constants';

const SPEED_OPTIONS: readonly SpinSpeed[] = ['fast', 'normal', 'suspense'];

type Props = {
  prefs: DecisionWheelPrefs;
  isSpinning: boolean;
  onUpdatePrefs: (patch: Partial<DecisionWheelPrefs>) => void;
  onSelectSpeed: (speed: SpinSpeed) => void;
  onSelectPalette: (paletteId: WheelPaletteId) => void;
};

/**
 * Compact control strip below the wheel stage for No-Repeat Draw, Web Audio SFX,
 * Winner Popup visibility, speed, and color theme.
 */
export default function WheelSettingsBar({
  prefs,
  isSpinning,
  onUpdatePrefs,
  onSelectSpeed,
  onSelectPalette,
}: Props) {
  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <TooltipRoot delay={{ open: 180, close: 0 }}>
            <TooltipTrigger>
              <span className="inline-flex">
                <Switch
                  checked={prefs.eliminateOnWin}
                  onChange={(checked) =>
                    onUpdatePrefs({ eliminateOnWin: checked })
                  }
                  label="No-Repeat Draw"
                  icon={Ban}
                  highlightIconOnChecked
                  size="sm"
                  labelPosition="right"
                  disabled={isSpinning}
                />
              </span>
            </TooltipTrigger>
            <TooltipPopup
              placement="top"
              showArrow
              className="max-w-[230px] px-3 py-2 text-left leading-relaxed"
            >
              Automatically removes each winning option after a spin until you
              restore all.
            </TooltipPopup>
          </TooltipRoot>

          <TooltipRoot delay={{ open: 180, close: 0 }}>
            <TooltipTrigger>
              <span className="inline-flex">
                <Switch
                  checked={prefs.soundEnabled}
                  onChange={(checked) =>
                    onUpdatePrefs({ soundEnabled: checked })
                  }
                  label="Sound Effects"
                  icon={Volume2}
                  highlightIconOnChecked
                  size="sm"
                  labelPosition="right"
                />
              </span>
            </TooltipTrigger>
            <TooltipPopup
              placement="top"
              showArrow
              className="max-w-[230px] px-3 py-2 text-left leading-relaxed"
            >
              Plays synthesized peg ticks while spinning and a chime when the
              wheel stops.
            </TooltipPopup>
          </TooltipRoot>

          <TooltipRoot delay={{ open: 180, close: 0 }}>
            <TooltipTrigger>
              <span className="inline-flex">
                <Switch
                  checked={prefs.showWinnerModal ?? true}
                  onChange={(checked) =>
                    onUpdatePrefs({ showWinnerModal: checked })
                  }
                  label="Winner Popup"
                  icon={Trophy}
                  highlightIconOnChecked
                  size="sm"
                  labelPosition="right"
                />
              </span>
            </TooltipTrigger>
            <TooltipPopup
              placement="top"
              showArrow
              className="max-w-[230px] px-3 py-2 text-left leading-relaxed"
            >
              Opens a celebration modal after each spin. Turn off for a subtle
              toast instead.
            </TooltipPopup>
          </TooltipRoot>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <Gauge size={13} />
            <span className="hidden sm:inline">Speed</span>
          </span>
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-neutral-100/70 p-0.5 dark:border-neutral-800 dark:bg-neutral-950/60">
            {SPEED_OPTIONS.map((speed) => (
              <Button
                key={speed}
                variant={prefs.spinSpeed === speed ? 'primary' : 'ghost'}
                size="xs"
                rounded="md"
                disabled={isSpinning}
                onClick={() => onSelectSpeed(speed)}
                className="h-6 px-2 text-[11px]"
              >
                {SPIN_SPEED_LABELS[speed]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Wheel Color Theme Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/70 pt-2.5 dark:border-neutral-800/70">
        <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <Palette size={13} className="text-sky-500" />
          <span>Wheel Theme</span>
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {WHEEL_PALETTES.map((palette) => (
            <button
              key={palette.id}
              type="button"
              disabled={isSpinning}
              onClick={() => onSelectPalette(palette.id)}
              aria-pressed={prefs.paletteId === palette.id}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50',
                prefs.paletteId === palette.id
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-600 dark:border-sky-400/50 dark:bg-sky-400/15 dark:text-sky-300'
                  : 'border-neutral-200/80 bg-white/60 text-neutral-600 hover:bg-neutral-100/80 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400 dark:hover:bg-neutral-800/70'
              )}
            >
              <span className="flex -space-x-1">
                {palette.colors.slice(0, 3).map((hex) => (
                  <span
                    key={hex}
                    className="h-2.5 w-2.5 rounded-full ring-1 ring-white dark:ring-neutral-900"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </span>
              <span>{palette.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
