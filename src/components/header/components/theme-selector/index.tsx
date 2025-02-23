'use client';

import clsx from 'clsx';
import {
  ForwardRefExoticComponent,
  RefAttributes,
  SVGProps,
  useEffect,
  useState,
} from 'react';
import {
  CloseButton,
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import { Moon, Sun, SunMoon } from 'lucide-react';
import useSwitchTheme, { Theme } from './hooks/use-switch-theme';
import { createPortal } from 'react-dom';

type SwitchButtonSettings = {
  component: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string | undefined;
      titleId?: string | undefined;
    } & RefAttributes<SVGSVGElement>
  >;
  text: string;
  theme: Theme;
};

type SwitchButtons = Array<SwitchButtonSettings>;

const Buttons: SwitchButtons = [
  {
    component: Sun,
    text: 'Light',
    theme: 'light',
  },
  {
    component: Moon,
    text: 'Dark',
    theme: 'dark',
  },
  {
    component: SunMoon,
    text: 'System',
    theme: 'system',
  },
];

export default function ThemeSelector() {
  const [body, setBody] = useState<HTMLElement | null>(null);

  const { theme, updateTheme } = useSwitchTheme();

  useEffect(() => {
    setBody(window.document.body);
  }, []);

  if (!body) return;

  return (
    <Popover className="group relative flex w-full justify-end">
      <PopoverButton
        className={clsx(
          'flex items-center',
          'rounded-md p-2 focus:outline-none',
          'data-[active]:bg-neutral-800/10 dark:data-[active]:bg-neutral-800/10 lg:dark:data-[active]:bg-neutral-700',
          'data-[hover]:hover:bg-neutral-800/10 dark:data-[hover]:bg-neutral-800/10 lg:dark:data-[hover]:bg-neutral-700'
        )}
      >
        <div className="mr-6 lg:hidden">Switch Theme</div>
        {theme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : theme === 'light' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <SunMoon className="h-5 w-5" />
        )}
      </PopoverButton>
      <PopoverPanel
        transition
        anchor="bottom end"
        className={clsx(
          'z-10 mt-6 origin-top-right rounded-md py-2 text-sm/6 font-semibold',
          'border border-neutral-800/20 dark:border-white/20',
          'bg-white/95 backdrop-blur-lg dark:bg-neutral-800',
          'focus:outline-none',
          'transition duration-100 ease-out',
          'data-[closed]:scale-95 data-[closed]:opacity-0'
        )}
      >
        {Buttons.map((button, idx) => (
          <CloseButton
            key={idx}
            className="flex w-full cursor-pointer px-4 py-1 pr-6 hover:bg-neutral-800/10 dark:hover:bg-neutral-700"
            onClick={() => updateTheme(button.theme)}
          >
            <div
              data-selected={theme === button.theme || undefined}
              className="flex w-full items-center px-3 py-2 data-[focus]:bg-neutral-800/10 data-[selected]:text-sky-500 data-[focus]:dark:bg-white/10"
            >
              <button.component className="h-5 w-5" />
              <div className="ml-4">{button.text}</div>
            </div>
          </CloseButton>
        ))}
      </PopoverPanel>
      {createPortal(
        <PopoverBackdrop className="invisible fixed inset-0 z-10 bg-transparent lg:visible" />,
        body
      )}
    </Popover>
  );
}
