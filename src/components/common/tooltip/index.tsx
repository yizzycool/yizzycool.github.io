'use client';

import clsx from 'clsx';
import {
  arrow,
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  type UseFloatingReturn,
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
  floating?: UseFloatingReturn;
  interactions?: UseInteractionsReturn;
  arrowRef?: React.RefObject<HTMLElement>;
  isOpen?: boolean;
};

type Props = {
  children: React.ReactNode;
};

export function TooltipRoot({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const floating = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(4), flip(), shift(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(floating.context, {
    delay: {
      open: 0,
      close: 100,
    },
  });
  const focus = useFocus(floating.context);
  const dismiss = useDismiss(floating.context);
  const role = useRole(floating.context, { role: 'tooltip' });

  const interactions = useInteractions([hover, focus, dismiss, role]);

  return (
    <TooltipContext.Provider
      value={{ floating, interactions, arrowRef, isOpen }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

type TooltipTriggerProps = {
  children: React.ReactElement;
};

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  const { floating, interactions } = useContext(TooltipContext);

  return cloneElement(
    children,
    interactions?.getReferenceProps({
      ref: floating?.refs.setReference,
      ...children.props,
    })
  );
}

type TooltipPopupProps = {
  children: React.ReactNode;
  className?: string;
};

export function TooltipPopup({ children, className }: TooltipPopupProps) {
  const { floating, interactions } = useContext(TooltipContext);
  const { isMounted, styles } = useTransitionStyles(floating!.context, {
    duration: 300,
    initial: {
      opacity: 0,
    },
    open: {
      opacity: 1,
    },
  });

  if (!isMounted) return null;

  return (
    <FloatingPortal>
      <div
        ref={floating!.refs.setFloating}
        style={{ ...floating!.floatingStyles, ...styles }}
        {...interactions!.getFloatingProps()}
        className={clsx('z-50', className)}
      >
        {children}
      </div>
    </FloatingPortal>
  );
}
