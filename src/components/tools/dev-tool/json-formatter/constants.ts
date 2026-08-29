import {
  Maximize2,
  Minimize2,
  Network,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';

export const TAB_ITEMS = [
  'Format',
  'Minify',
  'Tree View',
  'YAML',
  'CSV',
] as const;

export type TabItem = (typeof TAB_ITEMS)[number];

export const TAB_ICONS = [
  Maximize2,
  Minimize2,
  Network,
  FileCode,
  FileSpreadsheet,
];

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
