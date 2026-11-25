import type { LucideIcon } from 'lucide-react';

import {
  Braces,
  FileCode,
  FileSpreadsheet,
  GitCompareArrows,
  Maximize2,
  Minimize2,
  Network,
  ShieldCheck,
} from 'lucide-react';

export const TAB_ITEMS = [
  'Format',
  'Minify',
  'Tree View',
  'Diff',
  'TypeScript',
  'Zod',
  'YAML',
  'CSV',
] as const;

export type TabItem = (typeof TAB_ITEMS)[number];

export const TAB_ICON_MAP: Record<TabItem, LucideIcon> = {
  Format: Maximize2,
  Minify: Minimize2,
  'Tree View': Network,
  Diff: GitCompareArrows,
  TypeScript: Braces,
  Zod: ShieldCheck,
  YAML: FileCode,
  CSV: FileSpreadsheet,
};

export const SAMPLE_JSON = JSON.stringify(
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    isActive: true,
    age: 30,
    address: {
      street: '123 Main Street',
      city: 'New York',
      zipcode: '10001',
    },
    hobbies: ['reading', 'hiking', 'coding'],
  },
  null,
  2
);

export const SAMPLE_COMPARE_JSON = JSON.stringify(
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@yizzy.dev',
    isActive: true,
    role: 'Staff Engineer',
    address: {
      street: '123 Main Street',
      city: 'San Francisco',
      zipcode: '94107',
    },
    hobbies: ['reading', 'photography', 'coding', 'climbing'],
  },
  null,
  2
);
