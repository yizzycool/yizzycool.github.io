'use client';

import type {
  FloatingRootContext,
  ReferenceType,
  UseInteractionsReturn,
} from '@floating-ui/react';
import type {
  TooltipPopupProps,
  TooltipRootProps,
  TooltipTriggerProps,
} from './types';

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
import { arrowBorderBySide, tooltipVariants } from './tooltip.variants';

type ToolTipContextType = {
  rootContext?: FloatingRootContext<ReferenceType>;
  interactions?: UseInteractionsReturn;
  setAnchor?: (node: HTMLElement | null) => void;
  setTooltip?: (node: HTMLElement | null) => void;
  isOpen?: boolean;
};

const TooltipContext = createContext<ToolTipContextType>({});

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
    },
    open: {
      opacity: 1,
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
