'use client';

import type { DropdownItemProps, DropdownProps } from './types';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

import { cn } from '@/utils/cn';

import {
  dropdownItemBaseStyles,
  dropdownMenuBaseStyles,
  getDropdownItemStyles,
} from './dropdown.variants';

export function DropdownItem({
  label,
  icon: Icon,
  onClick,
  disabled = false,
  isDanger = false,
  isActive = false,
  className = '',
  children,
}: DropdownItemProps) {
  return (
    <MenuItem>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          dropdownItemBaseStyles,
          getDropdownItemStyles(disabled, isActive, isDanger),
          className
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1 truncate">{label ?? children}</span>
      </button>
    </MenuItem>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'my-1 h-px bg-neutral-200/80 transition-colors duration-200 dark:bg-neutral-800/80',
        className
      )}
    />
  );
}

export function Dropdown({
  trigger,
  items,
  placement = 'bottom end',
  className = '',
  menuClassName = '',
  modal = false,
  children,
}: DropdownProps) {
  return (
    <Menu as="div" className={cn('relative inline-flex', className)}>
      <MenuButton as="div" className="inline-flex cursor-pointer">
        {trigger}
      </MenuButton>

      <MenuItems
        transition
        modal={modal}
        anchor={{ to: placement, gap: 6 }}
        className={cn(dropdownMenuBaseStyles, menuClassName)}
      >
        {items
          ? items.map((item, idx) => (
              <DropdownItem
                key={item.id || idx}
                label={item.label}
                icon={item.icon}
                onClick={item.onClick}
                disabled={item.disabled}
                isDanger={item.isDanger}
                isActive={item.isActive}
                className={item.className}
              />
            ))
          : children}
      </MenuItems>
    </Menu>
  );
}
