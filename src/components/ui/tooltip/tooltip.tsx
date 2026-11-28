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
  useMergeRefs,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/utils/cn';
import { arrowBorderBySide, tooltipVariants } from './tooltip.variants';

type ToolTipContextType = {
  rootContext?: FloatingRootContext<ReferenceType>;
  interactions?: UseInteractionsReturn;
  getTouchReferenceProps?: (
    childProps: Record<string, unknown>
  ) => Record<string, unknown>;
  setAnchor?: (node: HTMLElement | null) => void;
  setTooltip?: (node: HTMLElement | null) => void;
  isOpen?: boolean;
};

const TooltipContext = createContext<ToolTipContextType>({});

const TOUCH_MOVE_CANCEL_THRESHOLD = 8;

export function TooltipRoot({
  children,
  delay = { open: 0, close: 100 },
  touchBehavior = 'long-press',
  longPressDelay = 450,
  touchAutoHideDelay = 1200,
}: TooltipRootProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [tooltip, setTooltip] = useState<HTMLElement | null>(null);

  const longPressTimerRef = useRef<number | null>(null);
  const autoHideTimerRef = useRef<number | null>(null);
  const suppressClickTimerRef = useRef<number | null>(null);
  const windowReleaseCleanupRef = useRef<(() => void) | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isTouchPressingRef = useRef(false);
  const longPressTriggeredRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const lastPointerWasTouchRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (autoHideTimerRef.current !== null) {
      window.clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
    if (suppressClickTimerRef.current !== null) {
      window.clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = null;
    }
    windowReleaseCleanupRef.current?.();
    windowReleaseCleanupRef.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (autoHideTimerRef.current !== null) {
        window.clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = null;
      }
    }
    setIsOpen(nextOpen);
  }, []);

  const rootContext = useFloatingRootContext({
    open: isOpen,
    onOpenChange: handleOpenChange,
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
    mouseOnly: true,
  });
  const focus = useFocus(rootContext, {
    visibleOnly: true,
  });
  const dismiss = useDismiss(rootContext);
  const role = useRole(rootContext, { role: 'tooltip' });

  const interactions = useInteractions([hover, focus, dismiss, role]);

  const finalizeLongPressTouch = useCallback(() => {
    isTouchPressingRef.current = false;
    startPosRef.current = null;
    windowReleaseCleanupRef.current?.();
    windowReleaseCleanupRef.current = null;

    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      if (autoHideTimerRef.current !== null) {
        window.clearTimeout(autoHideTimerRef.current);
      }
      autoHideTimerRef.current = window.setTimeout(() => {
        autoHideTimerRef.current = null;
        setIsOpen(false);
      }, touchAutoHideDelay);

      if (suppressClickTimerRef.current !== null) {
        window.clearTimeout(suppressClickTimerRef.current);
      }
      suppressClickTimerRef.current = window.setTimeout(() => {
        suppressClickTimerRef.current = null;
        suppressNextClickRef.current = false;
      }, 350);
    }
  }, [touchAutoHideDelay]);

  const getTouchReferenceProps = useCallback(
    (childProps: Record<string, unknown>): Record<string, unknown> => {
      const childOnPointerDown = childProps.onPointerDown as
        | ((e: React.PointerEvent<HTMLElement>) => void)
        | undefined;
      const childOnPointerMove = childProps.onPointerMove as
        | ((e: React.PointerEvent<HTMLElement>) => void)
        | undefined;
      const childOnPointerUp = childProps.onPointerUp as
        | ((e: React.PointerEvent<HTMLElement>) => void)
        | undefined;
      const childOnPointerCancel = childProps.onPointerCancel as
        | ((e: React.PointerEvent<HTMLElement>) => void)
        | undefined;
      const childOnClick = childProps.onClick as
        | ((e: React.MouseEvent<HTMLElement>) => void)
        | undefined;
      const childOnContextMenu = childProps.onContextMenu as
        | ((e: React.MouseEvent<HTMLElement>) => void)
        | undefined;

      if (touchBehavior === 'none') {
        return {};
      }

      if (touchBehavior === 'tap') {
        return {
          onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
            lastPointerWasTouchRef.current = e.pointerType !== 'mouse';
            childOnPointerDown?.(e);
          },
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            if (lastPointerWasTouchRef.current) {
              lastPointerWasTouchRef.current = false;
              setIsOpen((prev) => !prev);
            }
            childOnClick?.(e);
          },
        };
      }

      return {
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
          childOnPointerDown?.(e);
          if (e.pointerType === 'mouse') {
            lastPointerWasTouchRef.current = false;
            return;
          }

          lastPointerWasTouchRef.current = true;
          clearTimers();
          longPressTriggeredRef.current = false;
          suppressNextClickRef.current = false;
          setIsOpen(false);
          isTouchPressingRef.current = true;
          startPosRef.current = { x: e.clientX, y: e.clientY };

          const handleWindowRelease = () => {
            finalizeLongPressTouch();
          };
          window.addEventListener('pointerup', handleWindowRelease, {
            once: true,
          });
          window.addEventListener('pointercancel', handleWindowRelease, {
            once: true,
          });
          windowReleaseCleanupRef.current = () => {
            window.removeEventListener('pointerup', handleWindowRelease);
            window.removeEventListener('pointercancel', handleWindowRelease);
          };

          longPressTimerRef.current = window.setTimeout(() => {
            longPressTimerRef.current = null;
            if (!isTouchPressingRef.current) return;
            longPressTriggeredRef.current = true;
            suppressNextClickRef.current = true;
            setIsOpen(true);
          }, longPressDelay);
        },
        onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
          childOnPointerMove?.(e);
          if (!isTouchPressingRef.current || !startPosRef.current) return;
          if (e.pointerType === 'mouse') return;
          const dist = Math.hypot(
            e.clientX - startPosRef.current.x,
            e.clientY - startPosRef.current.y
          );
          if (dist > TOUCH_MOVE_CANCEL_THRESHOLD) {
            isTouchPressingRef.current = false;
            startPosRef.current = null;
            if (longPressTimerRef.current !== null) {
              window.clearTimeout(longPressTimerRef.current);
              longPressTimerRef.current = null;
            }
          }
        },
        onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
          childOnPointerUp?.(e);
          if (e.pointerType === 'mouse') return;
          finalizeLongPressTouch();
        },
        onPointerCancel: (e: React.PointerEvent<HTMLElement>) => {
          childOnPointerCancel?.(e);
          if (e.pointerType === 'mouse') return;
          finalizeLongPressTouch();
        },
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            if (suppressClickTimerRef.current !== null) {
              window.clearTimeout(suppressClickTimerRef.current);
              suppressClickTimerRef.current = null;
            }
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          childOnClick?.(e);
        },
        onContextMenu: (e: React.MouseEvent<HTMLElement>) => {
          if (
            isTouchPressingRef.current ||
            longPressTriggeredRef.current ||
            suppressNextClickRef.current
          ) {
            e.preventDefault();
            return;
          }
          childOnContextMenu?.(e);
        },
      };
    },
    [clearTimers, finalizeLongPressTouch, longPressDelay, touchBehavior]
  );

  return (
    <TooltipContext.Provider
      value={{
        rootContext,
        interactions,
        getTouchReferenceProps,
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
  const { interactions, getTouchReferenceProps, setAnchor } =
    useContext(TooltipContext);
  const childRef = (children as unknown as { ref?: React.Ref<HTMLElement> })
    ?.ref;
  const ref = useMergeRefs([setAnchor, childRef]);
  const touchProps = getTouchReferenceProps
    ? getTouchReferenceProps(children.props)
    : {};

  return cloneElement(
    children,
    interactions?.getReferenceProps({
      ...children.props,
      ...touchProps,
      ref,
    })
  );
}

export function TooltipPopup({
  placement = 'bottom',
  showArrow,
  variant = 'default',
  className,
  arrowClassName,
  children,
}: TooltipPopupProps) {
  const { rootContext, interactions, setTooltip } = useContext(TooltipContext);

  const [arrowEl, setArrowEl] = useState<HTMLDivElement | null>(null);

  const offsetValue = showArrow ? 8 : 6;

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

  const currentVariant = tooltipVariants[variant] || tooltipVariants.default;
  const computedArrowBorder =
    variant !== 'raw' && arrowSide ? arrowBorderBySide[arrowSide] : '';

  return (
    <FloatingPortal>
      <div
        ref={setTooltip}
        style={{ ...floating!.floatingStyles, ...styles }}
        {...interactions!.getFloatingProps()}
        className={cn(
          'pointer-events-none z-50 lg:pointer-events-auto',
          currentVariant.container,
          className
        )}
      >
        {showArrow && (
          <div
            ref={setArrowEl}
            className={cn(
              'absolute z-[-1] size-3 rotate-45',
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
