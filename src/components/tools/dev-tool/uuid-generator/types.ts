export type IdentifierFormat =
  | 'uuid-v4'
  | 'uuid-v4-compact'
  | 'uuid-v7'
  | 'nanoid'
  | 'ulid'
  | 'cuid2'
  | 'hex-16'
  | 'hex-32'
  | 'base64url';

export type GeneratorMode = 'overview' | 'batch';

export type AlphabetPreset =
  | 'url-safe'
  | 'alphanumeric'
  | 'lowercase'
  | 'uppercase'
  | 'numbers'
  | 'hex'
  | 'no-ambiguous'
  | 'custom';

export type QuoteStyle = 'none' | 'single' | 'double';

export type SeparatorStyle = 'newline' | 'comma' | 'json';

export type FormatMetadata = {
  id: IdentifierFormat;
  name: string;
  badge: string;
  description: string;
  defaultLength?: number;
  supportsCustomAlphabet?: boolean;
};

export type OverviewItem = {
  id: IdentifierFormat;
  name: string;
  badge: string;
  value: string;
  description: string;
};

export type BatchOptions = {
  format: IdentifierFormat;
  count: number;
  uppercase: boolean;
  hyphens: boolean;
  quoteStyle: QuoteStyle;
  separator: SeparatorStyle;
  nanoidLength: number;
  alphabetPreset: AlphabetPreset;
  customAlphabet: string;
};
