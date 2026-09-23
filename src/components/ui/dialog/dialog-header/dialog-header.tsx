'use client';

import type { DialogHeaderProps } from './types';

import { Description, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import {
  dialogHeaderBaseStyles,
  dialogHeaderBorderStyles,
  dialogHeaderCloseButtonStyles,
  dialogHeaderDescStyles,
  dialogHeaderIconContainerStyles,
  dialogHeaderTitleStyles,
} from './dialog-header.variants';

export function DialogHeader({
  title,
  description,
  icon: Icon,
  iconSize = 18,
  iconClassName = '',
  iconContainerClassName = '',
  onClose,
  closeAriaLabel = 'Close dialog',
  bordered = true,
  className = '',
  actions,
  children,
}: DialogHeaderProps) {
  return (
    <div
      className={cn(
        dialogHeaderBaseStyles,
        bordered && dialogHeaderBorderStyles,
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className={cn(
              dialogHeaderIconContainerStyles,
              iconContainerClassName
            )}
          >
            <Icon size={iconSize} className={iconClassName} />
          </div>
        )}
        {(title || description) && (
          <div>
            {typeof title === 'string' ? (
              <DialogTitle as="h3" className={dialogHeaderTitleStyles}>
                {title}
              </DialogTitle>
            ) : (
              title
            )}
            {typeof description === 'string' ? (
              <Description as="p" className={dialogHeaderDescStyles}>
                {description}
              </Description>
            ) : (
              description
            )}
          </div>
        )}
        {children}
      </div>

      {(actions || onClose) && (
        <div className="flex items-center gap-2">
          {actions}
          {onClose && (
            <Button
              variant="ghost"
              size="base"
              rounded="full"
              icon={X}
              onClick={onClose}
              ariaLabel={closeAriaLabel}
              className={dialogHeaderCloseButtonStyles}
            />
          )}
        </div>
      )}
    </div>
  );
}
