'use client';

import { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import useSwitchTheme from './hooks/use-switch-theme';

const Buttons = [
  {
    component: SunIcon,
    text: 'Light',
    theme: 'light',
  },
  {
    component: MoonIcon,
    text: 'Dark',
    theme: 'dark',
  },
  {
    component: ComputerDesktopIcon,
    text: 'System',
    theme: 'system',
  },
];

export default function ThemeSelector() {
  const { theme, updateTheme } = useSwitchTheme();

  return (
    <Menu>
      <MenuButton className="rounded-md p-2 data-[hover]:dark:bg-neutral-700 data-[open]:dark:bg-neutral-700">
        {theme === 'dark' ? (
          <MoonIcon className="h-5 w-5" />
        ) : theme === 'light' ? (
          <SunIcon className="h-5 w-5" />
        ) : (
          <ComputerDesktopIcon className="h-5 w-5" />
        )}
      </MenuButton>
      <MenuItems
        transition
        anchor="bottom end"
        className="z-10 mt-5 w-36 origin-top-right rounded-md border border-neutral-800/20 bg-white p-1 text-sm/6 font-semibold transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 dark:border-white/20 dark:bg-neutral-800"
      >
        {Buttons.map((button, idx) => (
          <Fragment key={idx}>
            <MenuItem>
              <button
                onClick={() => updateTheme(button.theme)}
                className="flex w-full items-center rounded-lg px-3 py-2 data-[focus]:bg-neutral-800/10 data-[selected]:text-sky-500 data-[focus]:dark:bg-white/10"
                data-selected={theme === button.theme || undefined}
              >
                <button.component className="h-5 w-5" />
                <div className="ml-4">{button.text}</div>
              </button>
            </MenuItem>
          </Fragment>
        ))}
      </MenuItems>
    </Menu>
  );
}
