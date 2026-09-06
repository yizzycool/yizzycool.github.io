import { FileCode, FileCode2, Table } from 'lucide-react';

export const TAB_ITEMS = ['Encode', 'Decode', 'Query Params'] as const;

export type TabItem = (typeof TAB_ITEMS)[number];

export const TAB_ICONS = [FileCode, FileCode2, Table];

export const SAMPLE_URL_TO_ENCODE =
  'https://api.example.com/v1/search?q=developer tools&category=web dev&sort=desc&filter=tags=react,nextjs#results';

export const SAMPLE_URL_TO_DECODE =
  'https%3A%2F%2Fapi.example.com%2Fv1%2Fsearch%3Fq%3Ddeveloper%2520tools%26category%3Dweb%2520dev%26sort%3Ddesc%26filter%3Dtags%253Dreact%252Cnextjs%23results';

export const SAMPLE_URL_WITH_PARAMS =
  'https://api.example.com/v1/search?q=developer+tools&category=web+dev&sort=desc&filter=active&page=1';
