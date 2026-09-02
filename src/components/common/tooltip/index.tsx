'use client';

import type {
  FloatingRootContext,
  Placement,
  ReferenceType,
  UseInteractionsReturn,
} from '@floating-ui/react';

import {
  arrow,
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFloatingRootContext,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import { cloneElement, createContext, useContext, useState } from 'react';

import { cn } from '@/utils/cn';

const TooltipContext = createContext<ToolTipContextType>({});

type ToolTipContextType = {
  rootContext?: FloatingRootContext<ReferenceType>;
  interactions?: UseInteractionsReturn;
  setAnchor?: (node: HTMLElement | null) => void;
  setTooltip?: (node: HTMLElement | null) => void;
  isOpen?: boolean;
};

export type TooltipDelay =
  | number
  | {
      open?: number;
      close?: number;
    };

export type TooltipRootProps = {
  children: React.ReactNode;
  delay?: TooltipDelay;
};

export function TooltipRoot({
  children,
  delay = { open: 0, close: 100 },
}: TooltipRootProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [tooltip, setTooltip] = useState<HTMLElement | null>(null);

  const rootContext = useFloatingRootContext({
    open: isOpen,
    onOpenChange: setIsOpen,
    elements: {
      reference: anchor!,
      floating: tooltip!,
    },
  });

  const computedDelay =
    typeof delay === 'number'
      ? delay
      : {
          open: delay.open ?? 0,
          close: delay.close ?? 100,
        };

  const hover = useHover(rootContext, {
    delay: computedDelay,
  });
  const focus = useFocus(rootContext);
  const dismiss = useDismiss(rootContext);
  const role = useRole(rootContext, { role: 'tooltip' });

  const interactions = useInteractions([hover, focus, dismiss, role]);

  return (
    <TooltipContext.Provider
      value={{
        rootContext,
        interactions,
        setAnchor,
        setTooltip,
        isOpen,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

type TooltipTriggerProps = {
  children: React.ReactElement<Record<string, unknown>>;
};

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  const { interactions, setAnchor } = useContext(TooltipContext);

  return cloneElement(
    children,
    interactions?.getReferenceProps({
      ref: setAnchor,
      ...children.props,
    })
  );
}

export type TooltipVariant =
  | 'card'
  | 'dark'
  | 'light'
  | 'accent'
  | 'inverse'
  | 'raw';

type VariantStyles = {
  container: string;
  arrow: string;
};

const tooltipVariants: Record<TooltipVariant, VariantStyles> = {
  card: {
    container:
      'rounded-xl border border-slate-200/90 bg-white/95 text-slate-800 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-slate-100 dark:shadow-black/50',
    arrow:
      'bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-neutral-800',
  },
  dark: {
    container:
      'rounded-lg border border-neutral-700/80 bg-neutral-900 text-slate-100 shadow-lg text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200',
    arrow:
      'bg-neutral-900 dark:bg-neutral-800 border-neutral-700/80 dark:border-neutral-700',
  },
  light: {
    container:
      'rounded-lg border border-slate-200 bg-white text-slate-800 shadow-md text-xs dark:border-neutral-700 dark:bg-neutral-100 dark:text-neutral-900',
    arrow:
      'bg-white dark:bg-neutral-100 border-slate-200 dark:border-neutral-700',
  },
  accent: {
    container:
      'rounded-xl border border-sky-500/30 bg-neutral-950/95 text-slate-100 shadow-lg shadow-sky-500/10 backdrop-blur-md dark:border-sky-500/40 dark:bg-neutral-950/95 dark:shadow-sky-500/20 text-xs',
    arrow: 'bg-neutral-950 border-sky-500/30 dark:border-sky-500/40',
  },
  inverse: {
    container:
      'rounded-lg border border-neutral-800 bg-neutral-900 text-white shadow-md text-xs dark:border-slate-200 dark:bg-slate-50 dark:text-slate-900',
    arrow:
      'bg-neutral-900 border-neutral-800 dark:bg-slate-50 dark:border-slate-200',
  },
  raw: {
    container: '',
    arrow: '',
  },
};

const arrowBorderBySide: Record<string, string> = {
  top: 'border-t border-l',
  bottom: 'border-b border-r',
  left: 'border-b border-l',
  right: 'border-t border-r',
};

type TooltipPopupProps = {
  placement?: Placement;
  showArrow?: boolean;
  variant?: TooltipVariant;
  className?: string;
  arrowClassName?: string;
  children: React.ReactNode;
};

export function TooltipPopup({
  placement = 'bottom',
  showArrow,
  variant = 'dark',
  className,
  arrowClassName,
  children,
}: TooltipPopupProps) {
  const { rootContext, interactions, setTooltip } = useContext(TooltipContext);

  const [arrowEl, setArrowEl] = useState<HTMLDivElement | null>(null);

  const offsetValue = showArrow ? 8 : 4;

  const floating = useFloating({
    rootContext,
    placement,
    middleware: [
      offset(offsetValue),
      flip(),
      shift(),
      showArrow &&
        arrow({
          element: arrowEl,
          padding: offsetValue,
        }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { isMounted, styles } = useTransitionStyles(floating!.context, {
    duration: 200,
    initial: {
      opacity: 0,
      // transform: 'scale(0.96)',
    },
    open: {
      opacity: 1,
      // transform: 'scale(1)',
    },
  });

  const arrowSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[floating!.placement.split('-')[0]] as string;

  if (!isMounted) return null;

  const currentVariant = tooltipVariants[variant] || tooltipVariants.dark;
  const computedArrowBorder =
    variant !== 'raw' && arrowSide ? arrowBorderBySide[arrowSide] : '';

  return (
    <FloatingPortal>
      <div
        ref={setTooltip}
        style={{ ...floating!.floatingStyles, ...styles }}
        {...interactions!.getFloatingProps()}
        className={cn('z-50', currentVariant.container, className)}
      >
        {showArrow && (
          <div
            ref={setArrowEl}
            className={cn(
              'absolute size-3 rotate-45',
              currentVariant.arrow,
              computedArrowBorder,
              arrowClassName
            )}
            style={{
              left: floating!.middlewareData.arrow?.x ?? '',
              top: floating!.middlewareData.arrow?.y ?? '',
              [arrowSide]: '-6px',
            }}
          />
        )}
        {children}
      </div>
    </FloatingPortal>
  );
}
