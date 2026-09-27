import type { BatchOptions, IdentifierFormat } from '../types';

import { ALPHABET_DEFINITIONS } from '../constants';
import { customNanoID } from './nanoid-engine';
import {
  generateBase64UrlToken,
  generateCUID2,
  generateHexToken,
  generateULID,
} from './token-engine';
import {
  generateUUIDv4,
  generateUUIDv4Compact,
  generateUUIDv7,
} from './uuid-engine';

/**
 * Generate a single identifier of the given format with options applied.
 */
export function generateIdentifier(
  format: IdentifierFormat,
  options?: Partial<BatchOptions>
): string {
  let value = '';

  switch (format) {
    case 'uuid-v4':
      value = generateUUIDv4();
      if (options?.hyphens === false) {
        value = value.replace(/-/g, '');
      }
      break;
    case 'uuid-v4-compact':
      value = generateUUIDv4Compact();
      break;
    case 'uuid-v7':
      value = generateUUIDv7();
      if (options?.hyphens === false) {
        value = value.replace(/-/g, '');
      }
      break;
    case 'nanoid': {
      const length = options?.nanoidLength ?? 21;
      const alphabet =
        options?.alphabetPreset === 'custom' && options.customAlphabet
          ? options.customAlphabet
          : ALPHABET_DEFINITIONS[options?.alphabetPreset ?? 'url-safe'];
      value = customNanoID(alphabet, length);
      break;
    }
    case 'ulid':
      value = generateULID();
      break;
    case 'cuid2':
      value = generateCUID2();
      break;
    case 'hex-16':
      value = generateHexToken(16);
      break;
    case 'hex-32':
      value = generateHexToken(32);
      break;
    case 'base64url':
      value = generateBase64UrlToken(24);
      break;
    default:
      value = generateUUIDv4();
  }

  if (options?.uppercase) {
    value = value.toUpperCase();
  }

  return value;
}

/**
 * Format a list of identifiers into a combined string based on quote and separator options.
 */
export function formatBatchString(
  items: string[],
  quoteStyle: BatchOptions['quoteStyle'] = 'none',
  separator: BatchOptions['separator'] = 'newline'
): string {
  if (items.length === 0) return '';

  if (separator === 'json') {
    return JSON.stringify(items, null, 2);
  }

  const quotedItems = items.map((item) => {
    if (quoteStyle === 'single') return `'${item}'`;
    if (quoteStyle === 'double') return `"${item}"`;
    return item;
  });

  if (separator === 'comma') {
    return quotedItems.join(', ');
  }

  return quotedItems.join('\n');
}
