'use client';

import type { WifiCardLayout, WifiCardState } from './types';

import { Palette } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs } from '@/components/ui/tabs';

import LabelBar from '../../common/label-bar';
import {
  WIFI_CARD_THEMES,
  WIFI_LAYOUT_ICONS,
  WIFI_LAYOUT_LABELS,
  WIFI_LAYOUT_TABS,
} from './constants';
import ThemeSwatchItem from './theme-swatch-item';

type Props = {
  state: WifiCardState;
  onUpdate: (patch: Partial<WifiCardState>) => void;
};

/**
 * Theme preset picker, physical print layout selector, welcome copy, and card display toggles.
 */
export default function CardStyleControls({ state, onUpdate }: Props) {
  return (
    <section aria-labelledby="wifi-style-heading" className="space-y-3">
      <LabelBar
        id="wifi-style-heading"
        label="Card Style & Print Layout"
        icon={Palette}
      />

      <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
        {/* Card Theme Grid */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200">
            Card Theme
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WIFI_CARD_THEMES.map((themeItem) => (
              <ThemeSwatchItem
                key={themeItem.id}
                theme={themeItem}
                selected={state.themeId === themeItem.id}
                onSelect={(themeId) => onUpdate({ themeId })}
              />
            ))}
          </div>
        </div>

        {/* Physical Card Aspect / Layout */}
        <div className="space-y-2 border-t border-neutral-200/70 pt-3.5 dark:border-neutral-800/70">
          <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200">
            Print Card Format
          </span>
          <Tabs<WifiCardLayout>
            tabs={WIFI_LAYOUT_TABS}
            activeTab={state.layout}
            onChange={(layout) => onUpdate({ layout })}
            tabLabels={WIFI_LAYOUT_LABELS}
            tabIcons={WIFI_LAYOUT_ICONS}
            size="xs"
            variant="segment"
            fullWidth
          />
        </div>

        {/* Welcome Message Customization */}
        <div className="space-y-3 border-t border-neutral-200/70 pt-3.5 dark:border-neutral-800/70">
          <div className="space-y-1.5">
            <label
              htmlFor="wifi-card-title"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200"
            >
              Card Heading
            </label>
            <Input
              id="wifi-card-title"
              value={state.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Welcome to Our Wi-Fi"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="wifi-card-subtitle"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200"
            >
              Subtitle / Helper Note
            </label>
            <Input
              id="wifi-card-subtitle"
              value={state.subtitle}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Point your phone camera at the QR code to join."
              className="text-xs"
            />
          </div>
        </div>

        {/* Privacy & Print Cut Guides */}
        <div className="space-y-3 border-t border-neutral-200/70 pt-3.5 dark:border-neutral-800/70">
          {state.encryption !== 'nopass' && (
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-200">
                  Show Password on Card
                </span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                  Mask with dots to enforce QR-only scanning
                </span>
              </div>
              <Switch
                size="sm"
                checked={state.showPassword}
                onChange={(showPassword) => onUpdate({ showPassword })}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-200">
                Print Cut Guides
              </span>
              <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                Add dashed trim border when printing on A4/Letter paper
              </span>
            </div>
            <Switch
              size="sm"
              checked={state.showCutGuides}
              onChange={(showCutGuides) => onUpdate({ showCutGuides })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
