import type {
  AlphabetPreset,
  BatchOptions,
  FormatMetadata,
  GeneratorMode,
  IdentifierFormat,
} from './types';

export const GENERATOR_MODES: GeneratorMode[] = ['overview', 'batch'];

export const GENERATOR_MODE_LABELS: Record<GeneratorMode, string> = {
  overview: 'All Formats Overview',
  batch: 'Batch Generation',
};

export const FORMAT_METADATA_LIST: FormatMetadata[] = [
  {
    id: 'uuid-v4',
    name: 'UUID v4',
    badge: 'RFC 4122',
    description: 'Cryptographically random 128-bit UUID (8-4-4-4-12)',
  },
  {
    id: 'uuid-v4-compact',
    name: 'UUID v4 (Compact)',
    badge: '32 Hex',
    description: 'Standard UUID v4 with hyphens stripped (32 chars)',
  },
  {
    id: 'uuid-v7',
    name: 'UUID v7',
    badge: 'RFC 9562',
    description:
      'Time-ordered UUID with 48-bit millisecond timestamp (Index-friendly)',
  },
  {
    id: 'nanoid',
    name: 'NanoID',
    badge: 'URL-Safe',
    description: 'Compact, URL-friendly unique string (default 21 chars)',
    defaultLength: 21,
    supportsCustomAlphabet: true,
  },
  {
    id: 'ulid',
    name: 'ULID',
    badge: '26 Chars',
    description:
      'Universally Unique Lexicographically Sortable Identifier (Crockford Base32)',
  },
  {
    id: 'cuid2',
    name: 'CUID2-like',
    badge: '24 Chars',
    description:
      'Secure, collision-resistant lowercase alphanumeric token for horizontal scale',
  },
  {
    id: 'hex-16',
    name: 'Hex Token (16-byte)',
    badge: '32 Hex',
    description:
      '128-bit secure random hex string for tokens, salts, and session IDs',
  },
  {
    id: 'hex-32',
    name: 'Hex Token (32-byte)',
    badge: '64 Hex',
    description:
      '256-bit high-entropy hex string for API secrets and CSRF tokens',
  },
  {
    id: 'base64url',
    name: 'Base64URL Token',
    badge: '32 Chars',
    description:
      'URL-safe Base64 random token without padding (OAuth & Webhooks)',
  },
];

export const FORMAT_MAP: Record<IdentifierFormat, FormatMetadata> =
  FORMAT_METADATA_LIST.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<IdentifierFormat, FormatMetadata>
  );

export const ALPHABET_DEFINITIONS: Record<AlphabetPreset, string> = {
  'url-safe':
    'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLFGQZ_bfghjklqvwyzrict',
  alphanumeric:
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  lowercase: '0123456789abcdefghijklmnopqrstuvwxyz',
  uppercase: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  hex: '0123456789abcdef',
  'no-ambiguous': '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz',
  custom: '',
};

export const ALPHABET_PRESET_LABELS: Record<AlphabetPreset, string> = {
  'url-safe': 'Standard URL-Safe (A-Z, a-z, 0-9, _, -)',
  alphanumeric: 'Alphanumeric (A-Z, a-z, 0-9)',
  lowercase: 'Lowercase + Digits (a-z, 0-9)',
  uppercase: 'Uppercase + Digits (A-Z, 0-9)',
  numbers: 'Digits Only (0-9)',
  hex: 'Hexadecimal (0-9, a-f)',
  'no-ambiguous': 'No Ambiguous Chars (excludes 0, O, I, l, 1)',
  custom: 'Custom Characters',
};

export const DEFAULT_BATCH_OPTIONS: BatchOptions = {
  format: 'uuid-v4',
  count: 10,
  uppercase: false,
  hyphens: true,
  quoteStyle: 'none',
  separator: 'newline',
  nanoidLength: 21,
  alphabetPreset: 'url-safe',
  customAlphabet: '',
};
