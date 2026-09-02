'use client';

import type { LucideIcon } from 'lucide-react';
import type { TransformAction } from './hooks/use-word-counter';

import {
  ArrowDown,
  ArrowDownAZ,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpZA,
  Code2,
  FoldVertical,
  Heading,
  Info,
  ListFilter,
  ListOrdered,
  Minus,
  Scissors,
  Space,
  Sparkles,
  Trash2,
  Type,
  Wand2,
} from 'lucide-react';
import { Fragment, useState } from 'react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/common/button';
import TextToolsModal from './text-tools-modal';

export type ToolItem = {
  label: string;
  icon: LucideIcon;
  actionType: TransformAction;
  title: string;
  description: string;
  example?: string;
};

export type ToolGroup = {
  name: string;
  items: ToolItem[];
};

const TOOL_GROUPS: ToolGroup[] = [
  {
    name: 'Case',
    items: [
      {
        label: 'UPPERCASE',
        icon: ArrowUp,
        actionType: 'upper',
        title: 'UPPERCASE',
        description: 'Convert all letters in the text to uppercase.',
        example: 'hello world → HELLO WORLD',
      },
      {
        label: 'lowercase',
        icon: ArrowDown,
        actionType: 'lower',
        title: 'lowercase',
        description: 'Convert all letters in the text to lowercase.',
        example: 'HELLO WORLD → hello world',
      },
      {
        label: 'Title Case',
        icon: Type,
        actionType: 'title',
        title: 'Title Case',
        description: 'Capitalize the first letter of each word.',
        example: 'hello world → Hello World',
      },
      {
        label: 'Sentence',
        icon: Heading,
        actionType: 'sentence',
        title: 'Sentence case',
        description: 'Capitalize the first letter of each sentence.',
        example: 'hello world. how are you? → Hello world. How are you?',
      },
      {
        label: 'camelCase',
        icon: Code2,
        actionType: 'camel',
        title: 'camelCase',
        description: 'Convert words to camelCase without spaces.',
        example: 'hello world test → helloWorldTest',
      },
      {
        label: 'kebab-case',
        icon: Minus,
        actionType: 'kebab',
        title: 'kebab-case',
        description: 'Convert spaces and separators to hyphens.',
        example: 'hello world → hello-world',
      },
      {
        label: 'snake_case',
        icon: Code2,
        actionType: 'snake',
        title: 'snake_case',
        description: 'Convert spaces and separators to underscores.',
        example: 'hello world → hello_world',
      },
    ],
  },
  {
    name: 'Clean & Format',
    items: [
      {
        label: 'Compact Spaces',
        icon: Space,
        actionType: 'compact-spaces',
        title: 'Compact Spaces',
        description:
          'Collapse multiple consecutive spaces into a single space.',
        example: 'hello    world → hello world',
      },
      {
        label: 'Remove Blank Lines',
        icon: Trash2,
        actionType: 'remove-blank-lines',
        title: 'Remove Blank Lines',
        description: 'Remove all completely empty or whitespace-only lines.',
        example: 'Line 1\n\nLine 2 → Line 1\nLine 2',
      },
      {
        label: 'Trim Lines',
        icon: Scissors,
        actionType: 'trim-lines',
        title: 'Trim Lines',
        description: 'Trim leading and trailing whitespaces from each line.',
        example: '  hello   → hello',
      },
      {
        label: 'Unwrap',
        icon: FoldVertical,
        actionType: 'unwrap',
        title: 'Unwrap Text',
        description: 'Join all lines into a continuous paragraph.',
        example: 'Line 1\nLine 2 → Line 1 Line 2',
      },
      {
        label: 'Strip Punctuation',
        icon: Sparkles,
        actionType: 'remove-punc',
        title: 'Remove Punctuation',
        description: 'Remove all English and Chinese punctuation marks.',
        example: 'Hello, world! → Hello world',
      },
    ],
  },
  {
    name: 'Lines & Order',
    items: [
      {
        label: 'Sort A-Z',
        icon: ArrowDownAZ,
        actionType: 'sort-asc',
        title: 'Sort Lines (A-Z)',
        description: 'Sort lines in ascending alphabetical order.',
        example: 'Banana\nApple → Apple\nBanana',
      },
      {
        label: 'Sort Z-A',
        icon: ArrowUpZA,
        actionType: 'sort-desc',
        title: 'Sort Lines (Z-A)',
        description: 'Sort lines in descending alphabetical order.',
        example: 'Apple\nBanana → Banana\nApple',
      },
      {
        label: 'Deduplicate',
        icon: ListFilter,
        actionType: 'dedup-lines',
        title: 'Remove Duplicate Lines',
        description: 'Remove duplicate lines and retain only unique lines.',
        example: 'Apple\nApple\nBanana → Apple\nBanana',
      },
      {
        label: 'Line Numbers',
        icon: ListOrdered,
        actionType: 'number-lines',
        title: 'Add Line Numbers',
        description: 'Prefix each line with its corresponding line number.',
        example: 'Apple\nBanana → 1. Apple\n2. Banana',
      },
      {
        label: 'Reverse',
        icon: ArrowLeftRight,
        actionType: 'reverse-text',
        title: 'Reverse Characters',
        description: 'Reverse the order of all characters in the text.',
        example: 'hello → olleh',
      },
    ],
  },
];

type ToolsProps = {
  onTransform: (actionType: TransformAction) => void;
  disabled?: boolean;
};

export default function Tools({ onTransform, disabled = false }: ToolsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          'space-y-3 px-4 py-3',
          'border-t border-neutral-200/70 dark:border-neutral-800/80',
          'bg-neutral-50/50 dark:bg-neutral-900/40'
        )}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Wand2 size={13} className="text-sky-500" />
            <span>Text Tools</span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-neutral-200/70 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-neutral-800 dark:hover:text-slate-300"
              aria-label="View Text Tools Guide"
            >
              <Info size={13} />
            </button>
          </div>
        </div>

        {/* Tool Groups List */}
        <div className="space-y-3 divide-y divide-neutral-200/60 pt-0.5 dark:divide-neutral-800/60">
          {TOOL_GROUPS.map((group) => (
            <div key={group.name} className="space-y-1.5 pt-3 first:pt-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.name}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {group.items.map((item, idx) => (
                  <Fragment key={item.actionType}>
                    <Button
                      variant="ghost"
                      size="xs"
                      rounded="md"
                      disabled={disabled}
                      onClick={() => onTransform(item.actionType)}
                      icon={item.icon}
                      className="h-7 text-xs font-medium text-slate-600 transition-all hover:bg-neutral-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                    >
                      {item.label}
                    </Button>
                    {idx < group.items.length - 1 && (
                      <div className="mx-0.5 h-3 w-px bg-neutral-200/80 dark:bg-neutral-800" />
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guide Modal */}
      <TextToolsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groups={TOOL_GROUPS}
      />
    </>
  );
}
