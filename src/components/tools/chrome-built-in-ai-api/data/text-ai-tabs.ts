import type { LucideIcon } from 'lucide-react';

import { FileText, PenTool, RefreshCcw, SpellCheck } from 'lucide-react';

export type TextAiTab = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const TEXT_AI_TABS: readonly TextAiTab[] = [
  {
    label: 'Writer',
    href: '/tools/chrome-built-in-ai-api/writer',
    icon: PenTool,
  },
  {
    label: 'Rewriter',
    href: '/tools/chrome-built-in-ai-api/rewriter',
    icon: RefreshCcw,
  },
  {
    label: 'Summarizer',
    href: '/tools/chrome-built-in-ai-api/summarizer',
    icon: FileText,
  },
  {
    label: 'Proofreader',
    href: '/tools/chrome-built-in-ai-api/proofreader',
    icon: SpellCheck,
  },
] as const;
