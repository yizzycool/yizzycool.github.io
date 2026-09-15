'use client';

import type { OptionTypes, SelectorOptionItem, SelectorProps } from './types';

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  size as floatingSize,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import { Description, Field, Label } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';

import { cn } from '@/utils/cn';
import {
  selectorChevronSizes,
  selectorChevronStyles,
  selectorMenuSizes,
  selectorMenuStyles,
  selectorOptionDisabledStyles,
  selectorOptionSizes,
  selectorOptionStyles,
  selectorTriggerSizes,
  selectorTriggerStyles,
} from './selector.variants';

export function Selector({
  title,
  desc,
  defaultValue,
  value,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className,
  size = 'base',
  onChange = () => {},
}: SelectorProps) {
  const selectorId = useId();
  const labelId = `${selectorId}-label`;
  const descId = `${selectorId}-desc`;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Normalize options to { label, value, disabled }
  const normalizedOptions: SelectorOptionItem[] = useMemo(() => {
    return options.map((option) => {
      if (typeof option === 'string') {
        return { label: option, value: option, disabled: false };
      }
      return {
        label: option.label,
        value: option.value,
        disabled: Boolean(option.disabled),
      };
    });
  }, [options]);

  // Uncontrolled fallback state
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (defaultValue !== undefined) return defaultValue;
    return normalizedOptions[0]?.value ?? '';
  });

  const currentValue = value !== undefined ? value : internalValue;
  const selectedOption = normalizedOptions.find(
    (opt) => opt.value === currentValue
  );

  const elementsRef = useRef<Array<HTMLElement | null>>([]);

  const {
    refs: { setReference, setFloating },
    floatingStyles,
    context,
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      floatingSize({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(availableHeight, 320)}px`,
          });
        },
        padding: 8,
      }),
    ],
  });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 160,
    initial: {
      opacity: 0,
      // transform: 'scale(0.96) translateY(-4px)',
    },
    open: {
      opacity: 1,
      // transform: 'scale(1) translateY(0px)',
    },
    close: {
      opacity: 0,
      // transform: 'scale(0.96) translateY(-4px)',
    },
  });

  const click = useClick(context, { event: 'mousedown', enabled: !disabled });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'listbox' });

  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    selectedIndex: normalizedOptions.findIndex(
      (opt) => opt.value === currentValue
    ),
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [click, dismiss, role, listNav]
  );

  const handleSelect = (val: string) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    onChange(val);
    setIsOpen(false);
  };

  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <Field className="w-full">
      {title && (
        <Label className="text-sm/6 font-bold text-slate-700 dark:text-slate-200">
          {title}
        </Label>
      )}
      {desc && (
        <Description className="mb-3 text-sm/6 text-slate-500 dark:text-slate-400">
          {desc}
        </Description>
      )}
      <button
        type="button"
        id={selectorId}
        ref={setReference}
        disabled={disabled}
        className={cn(
          selectorTriggerStyles,
          selectorTriggerSizes[size],
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={title ? labelId : undefined}
        aria-describedby={desc ? descId : undefined}
        {...getReferenceProps()}
      >
        <span
          className={cn(
            'truncate font-mono',
            size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm',
            !selectedOption && 'text-slate-400 dark:text-slate-500'
          )}
        >
          {displayLabel}
        </span>
        <span className="ml-2 flex shrink-0 items-center">
          <ChevronDown
            className={cn(
              selectorChevronStyles,
              selectorChevronSizes[size],
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </span>
      </button>

      <FloatingPortal>
        {isMounted && (
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={setFloating}
              style={{ ...floatingStyles, ...transitionStyles }}
              className={cn(selectorMenuStyles, selectorMenuSizes[size])}
              {...getFloatingProps()}
            >
              {normalizedOptions.map((option, index) => (
                <Option
                  key={option.value}
                  elementsRef={elementsRef}
                  option={option}
                  currentValue={currentValue}
                  index={index}
                  activeIndex={activeIndex}
                  size={size}
                  getItemProps={getItemProps}
                  handleSelect={handleSelect}
                />
              ))}
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </Field>
  );
}

function Option({
  elementsRef,
  option,
  currentValue,
  index,
  activeIndex,
  size = 'base',
  getItemProps,
  handleSelect,
}: OptionTypes) {
  const isSelected = option.value === currentValue;
  const isFocused = activeIndex === index;

  return (
    <div
      ref={(node) => {
        elementsRef.current[index] = node;
      }}
      role="option"
      tabIndex={isFocused ? 0 : -1}
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      data-focus={isFocused}
      className={cn(
        selectorOptionStyles,
        selectorOptionSizes[size],
        option.disabled && selectorOptionDisabledStyles
      )}
      {...getItemProps({
        onClick() {
          if (!option.disabled) {
            handleSelect(option.value);
          }
        },
        onKeyDown(event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!option.disabled) {
              handleSelect(option.value);
            }
          }
        },
      })}
    >
      <span className="truncate">{option.label}</span>
      {isSelected && (
        <span className="ml-2 flex shrink-0 items-center text-sky-600 dark:text-sky-400">
          <Check
            className={cn(
              size === 'xs' || size === 'sm' ? 'size-3.5' : 'size-4'
            )}
            strokeWidth={2.5}
          />
        </span>
      )}
    </div>
  );
}
