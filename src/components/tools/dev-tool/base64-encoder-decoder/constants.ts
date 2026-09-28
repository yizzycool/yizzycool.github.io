import { FileCode, FileCode2 } from 'lucide-react';
import { TAB_ITEMS } from './types';

export { TAB_ITEMS };

export const TAB_ICONS = [FileCode, FileCode2];

export const FORMAT_OPTIONS = [
  {
    id: 'standard' as const,
    label: 'Standard Base64',
    subLabel: 'RFC 4648 §4 (+, /, =)',
    desc: 'Standard Base64 format using + and /, padded with = to a multiple of 4.',
  },
  {
    id: 'base64url' as const,
    label: 'Base64URL',
    subLabel: 'RFC 4648 §5 (-, _, no padding)',
    desc: 'URL and filename safe format using - and _, omitting = padding. Compatible with JWT and URL parameters.',
  },
];

export const SAMPLE_TEXT_TO_ENCODE =
  'The quick brown fox jumps over the lazy dog. 🦊';

// Corresponding Base64 and Base64URL representations of SAMPLE_TEXT_TO_ENCODE
export const SAMPLE_BASE64_TO_DECODE =
  'VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZy4g8J+mhg==';

export const SAMPLE_BASE64URL_TO_DECODE =
  'VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZy4g8J-mhg';
