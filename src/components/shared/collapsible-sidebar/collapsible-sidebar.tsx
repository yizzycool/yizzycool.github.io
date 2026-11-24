'use client';

import type { SidebarScope } from './constants';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { useLocalStorage } from '@/hooks/window/use-local-storage';
import { cn } from '@/utils/cn';

import { SIDEBAR_DATA_ATTRS, SIDEBAR_STORAGE_KEYS } from './constants';

const TOOLTIP_POPUP_CLASS =
  'flex items-center gap-2 whitespace-nowrap px-2.5 py-1.5';

const TOOLTIP_KBD_CLASS =
  'rounded border border-slate-200/90 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-slate-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-400';

type CollapsibleSidebarProps = {
  scope: SidebarScope;
  title: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Desktop collapsible navigation sidebar with independent scoped persistence (`localStorage`),
 * zero-CLS initial rendering via `<SidebarInitScript />`, and an edge-docked expand trigger.
 */
export function CollapsibleSidebar({
  scope,
  title,
  children,
  className,
}: CollapsibleSidebarProps) {
  const { getFadeUpClass } = useGetTransitionClass();
  const isApplePlatform = useSyncExternalStore(
    emptySubscribe,
    getIsAppleClient,
    getFalseServerSnapshot
  );

  const storageKey = SIDEBAR_STORAGE_KEYS[scope];
  const dataAttr = SIDEBAR_DATA_ATTRS[scope];

  const { value: isCollapsed, setValue: setIsCollapsed } =
    useLocalStorage<boolean>(storageKey, false);

  const updateCollapsed = useCallback(
    (nextCollapsed: boolean) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute(
          dataAttr,
          nextCollapsed ? 'collapsed' : 'expanded'
        );
      }
      setIsCollapsed(nextCollapsed);
    },
    [dataAttr, setIsCollapsed]
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      dataAttr,
      isCollapsed ? 'collapsed' : 'expanded'
    );
  }, [dataAttr, isCollapsed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || window.innerWidth < 1024) return;
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key === '\\'
      ) {
        event.preventDefault();
        updateCollapsed(!isCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, updateCollapsed]);

  const shortcutLabel = isApplePlatform ? '⌘\\' : 'Ctrl+\\';

  return (
    <>
      <div
        data-collapsible-sidebar={scope}
        className={cn(
          getFadeUpClass(),
          'sticky top-[68px] hidden h-[calc(100dvh_-_68px)] w-[300px] shrink-0 overflow-hidden',
          'border-r border-neutral-400/20',
          'transition-[width,border-color] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:block',
          className
        )}
      >
        <div
          data-collapsible-sidebar-inner={scope}
          inert={isCollapsed}
          aria-hidden={isCollapsed}
          className="flex h-full w-[300px] flex-col transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none"
        >
          <div className="flex shrink-0 items-center justify-between px-4 pb-1.5 pt-3">
            <span className="select-none text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              {title}
            </span>

            <TooltipRoot delay={{ open: 350, close: 100 }}>
              <TooltipTrigger>
                <button
                  type="button"
                  onClick={() => updateCollapsed(true)}
                  aria-label={`Collapse ${title} sidebar`}
                  aria-expanded={!isCollapsed}
                  className={cn(
                    'inline-flex size-7 items-center justify-center rounded-lg transition-colors',
                    'text-slate-400 hover:bg-slate-200/70 hover:text-slate-700',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60',
                    'dark:text-slate-500 dark:hover:bg-neutral-800 dark:hover:text-slate-200'
                  )}
                >
                  <PanelLeftClose size={16} strokeWidth={1.9} />
                </button>
              </TooltipTrigger>
              <TooltipPopup placement="right" className={TOOLTIP_POPUP_CLASS}>
                <span>Collapse sidebar</span>
                <kbd className={TOOLTIP_KBD_CLASS}>{shortcutLabel}</kbd>
              </TooltipPopup>
            </TooltipRoot>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>

      <div
        data-sidebar-expand-trigger={scope}
        className="pointer-events-none fixed left-0 top-[112px] z-30 hidden -translate-x-full opacity-0 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none lg:block"
      >
        <TooltipRoot delay={{ open: 250, close: 100 }}>
          <TooltipTrigger>
            <button
              type="button"
              onClick={() => updateCollapsed(false)}
              tabIndex={isCollapsed ? 0 : -1}
              aria-label={`Expand ${title} sidebar`}
              aria-expanded={!isCollapsed}
              className={cn(
                'group inline-flex items-center justify-center rounded-r-xl border border-l-0 py-2.5 pl-2 pr-2.5',
                'border-neutral-300/75 bg-white/85 text-slate-500 backdrop-blur-md',
                'shadow-[0_4px_16px_-4px_rgba(15,23,42,0.14)]',
                'transition-all duration-200',
                'hover:border-sky-400/50 hover:bg-white hover:pl-3.5 hover:text-sky-600 hover:shadow-[0_6px_20px_-4px_rgba(14,165,233,0.22)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60',
                'dark:border-neutral-700/75 dark:bg-neutral-900/85 dark:text-slate-400 dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.45)]',
                'dark:hover:border-sky-500/40 dark:hover:bg-neutral-800 dark:hover:text-sky-400'
              )}
            >
              <PanelLeftOpen
                size={17}
                strokeWidth={1.9}
                className="transition-transform duration-200 group-hover:scale-105"
              />
            </button>
          </TooltipTrigger>
          <TooltipPopup placement="right" className={TOOLTIP_POPUP_CLASS}>
            <span>Expand sidebar</span>
            <kbd className={TOOLTIP_KBD_CLASS}>{shortcutLabel}</kbd>
          </TooltipPopup>
        </TooltipRoot>
      </div>
    </>
  );
}

function emptySubscribe() {
  return () => {};
}

function getIsAppleClient(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /mac|iphone|ipad|ipod/i.test(
    navigator.platform || navigator.userAgent
  );
}

function getFalseServerSnapshot(): boolean {
  return false;
}
