'use client';

import { Search } from 'lucide-react';

import { HotkeyBadge } from '@/components/ui/badge/hotkey-badge';
import { cn } from '@/utils/cn';
import { Input } from '../input';
import type { SearchInputProps } from './types';

export function SearchInput({
  ref,
  inputRef,
  value,
  hotkey,
  hotkeySize = 'sm',
  placeholder = 'Search...',
  className = '',
  containerClassName = '',
  ...props
}: SearchInputProps) {
  const hasValue = Boolean(
    value !== undefined && value !== null && String(value).length > 0
  );

  const resolvedRef = inputRef || ref;

  return (
    <div className={cn('relative w-full', containerClassName)}>
      <Input
        ref={resolvedRef}
        type="text"
        icon={Search}
        value={value}
        placeholder={placeholder}
        className={cn(hotkey && !hasValue && 'pr-12', className)}
        {...props}
      />
      {hotkey && !hasValue && (
        <HotkeyBadge
          size={hotkeySize}
          symbol={hotkey}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        />
      )}
    </div>
  );
}
