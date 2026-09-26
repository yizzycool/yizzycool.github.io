import type {
  HashAlgorithm,
  HashCaseMode,
  HashEncoding,
  HashInputMode,
} from './types';

export const HASH_ALGORITHMS: Array<{
  id: HashAlgorithm;
  label: string;
  bitLength: number;
  description: string;
}> = [
  {
    id: 'MD5',
    label: 'MD5',
    bitLength: 128,
    description:
      '128-bit checksum widely used for legacy file integrity verification.',
  },
  {
    id: 'SHA-1',
    label: 'SHA-1',
    bitLength: 160,
    description:
      '160-bit hash function commonly found in Git revisions and legacy protocols.',
  },
  {
    id: 'SHA-256',
    label: 'SHA-256',
    bitLength: 256,
    description:
      'Industry standard cryptographic hash for security certificates and blockchains.',
  },
  {
    id: 'SHA-384',
    label: 'SHA-384',
    bitLength: 384,
    description:
      'High-security truncated SHA-2 family hash recommended for sensitive data.',
  },
  {
    id: 'SHA-512',
    label: 'SHA-512',
    bitLength: 512,
    description:
      'Maximum strength 512-bit hash offering superior collision resistance.',
  },
];

export const HASH_INPUT_MODES: HashInputMode[] = ['text', 'file'];

export const HASH_INPUT_MODE_LABELS: Record<HashInputMode, string> = {
  text: 'Text Mode',
  file: 'File Mode',
};

export const HASH_ENCODINGS: HashEncoding[] = ['hex', 'base64'];

export const HASH_ENCODING_LABELS: Record<HashEncoding, string> = {
  hex: 'Hexadecimal',
  base64: 'Base64',
};

export const HASH_CASE_MODES: HashCaseMode[] = ['lower', 'upper'];

export const HASH_CASE_MODE_LABELS: Record<HashCaseMode, string> = {
  lower: 'lowercase',
  upper: 'UPPERCASE',
};

export const DEFAULT_SAMPLE_TEXT = '';
