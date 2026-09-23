'use client';

import type { LucideIcon } from 'lucide-react';
import type { Theme } from '@/hooks/dom/use-switch-theme';

import { Moon, Sun, SunMoon } from 'lucide-react';

import useSwitchTheme from '@/hooks/dom/use-switch-theme';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/utils/cn';

type ThemeOption = {
  icon: LucideIcon;
  text: string;
  theme: Theme;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    icon: Sun,
    text: 'Light',
    theme: 'light',
  },
  {
    icon: Moon,
    text: 'Dark',
    theme: 'dark',
  },
  {
    icon: SunMoon,
    text: 'System',
    theme: 'system',
  },
];

export default function ThemeSelector() {
  const { theme, updateTheme } = useSwitchTheme();

  const CurrentThemeIcon =
    theme === 'dark' ? Moon : theme === 'light' ? Sun : SunMoon;

  const trigger = (
    <div
      className={cn(
        'flex items-center',
        'transition-all duration-200',
        'rounded-full p-2 outline-none',
        'hover:bg-neutral-800/10 dark:hover:bg-neutral-700'
      )}
      aria-label="theme"
    >
      <CurrentThemeIcon size={20} />
    </div>
  );

  const items = THEME_OPTIONS.map((option) => ({
    id: option.theme,
    label: option.text,
    icon: option.icon,
    isActive: theme === option.theme,
    onClick: () => updateTheme(option.theme),
  }));

  return (
    <Dropdown
      trigger={trigger}
      items={items}
      placement="bottom end"
      menuClassName="min-w-[120px]"
    />
  );
}
