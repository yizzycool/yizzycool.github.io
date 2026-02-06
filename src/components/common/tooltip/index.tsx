'use client';

import clsx from 'clsx';
import {
  arrow,
  autoUpdate,
  flip,
  FloatingPortal,
  type FloatingRootContext,
  offset,
  type Placement,
  type ReferenceType,
  shift,
  useDismiss,
  useFloating,
  useFloatingRootContext,
  useFocus,
  useHover,
  useInteractions,
  type UseInteractionsReturn,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import {
  cloneElement,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react';

const TooltipContext = createContext<ToolTipContextType>({});

type ToolTipContextType = {
  rootContext?: FloatingRootContext<ReferenceType>;
  interactions?: UseInteractionsReturn;
  setAnchor?: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setTooltip?: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  isOpen?: boolean;
};

type Props = {
  children: React.ReactNode;
};

export function TooltipRoot({ children }: Props) {
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

  const hover = useHover(rootContext, {
    delay: {
      open: 0,
      close: 100,
    },
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
  children: React.ReactElement;
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

type TooltipPopupProps = {
  placement?: Placement;
  showArrow?: boolean;
  className?: string;
  arrowClassName?: string;
  children: React.ReactNode;
};

export function TooltipPopup({
  placement = 'bottom',
  showArrow,
  className,
  arrowClassName,
  children,
}: TooltipPopupProps) {
  const { rootContext, interactions, setTooltip } = useContext(TooltipContext);

  const arrowRef = useRef(null);

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
          element: arrowRef,
          padding: offsetValue,
        }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { isMounted, styles } = useTransitionStyles(floating!.context, {
    duration: 300,
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

  return (
    <FloatingPortal>
      <div
        // ref={floating!.refs.setFloating}
        // ref={floatingRef}
        ref={setTooltip}
        style={{ ...floating!.floatingStyles, ...styles }}
        {...interactions!.getFloatingProps()}
        className={clsx('z-50', className)}
      >
        {showArrow && (
          <div
            ref={arrowRef}
            className={clsx('absolute size-3 rotate-45', arrowClassName)}
            style={{
              left: floating!.middlewareData.arrow?.x ?? '',
              top: floating!.middlewareData.arrow?.y ?? '',
              [arrowSide]: '-4px',
            }}
          />
        )}
        {children}
      </div>
    </FloatingPortal>
  );
}
