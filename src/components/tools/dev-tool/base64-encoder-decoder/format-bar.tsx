'use client';

import type { ReactNode } from 'react';
import type { Base64Format } from './types';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

import { PillTabs } from '@/components/ui/tabs';

import DiffDialog from './diff-dialog';
import { Button } from '@/components/ui/button';

type Props = {
  format: Base64Format;
  onChangeFormat: (format: Base64Format) => void;
};

const FORMAT_TABS: Base64Format[] = ['standard', 'base64url'];

const FORMAT_TAB_LABELS: Record<Base64Format, ReactNode> = {
  standard: 'Base64',
  base64url: 'Base64URL',
};

export default function FormatBar({ format, onChangeFormat }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <PillTabs<Base64Format>
          tabs={FORMAT_TABS}
          activeTab={format}
          onChange={onChangeFormat}
          tabLabels={FORMAT_TAB_LABELS}
          variant="segment"
          size="xs"
          rounded="md"
        />

        <Button
          variant="ghost"
          hoverEffect={false}
          onClick={() => setIsDialogOpen(true)}
          rounded="full"
          size="sm"
          className="p-0"
          icon={HelpCircle}
          iconClassName="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors"
          title="Click to view detailed comparison & examples"
          aria-label="Click to view detailed comparison & examples"
        />
      </div>

      <DiffDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
