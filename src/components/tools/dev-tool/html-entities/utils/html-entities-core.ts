import type { EntityFormat, EntityScope } from '../types';

import {
  NAMED_ENTITIES,
  REVERSE_NAMED_ENTITIES,
  SPECIAL_CHARS,
} from '../constants';

const ENTITY_REGEX = /&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z0-9]+);/g;

/**
 * Encodes text into HTML entities based on chosen format and scope
 */
export function encodeHtmlEntities(
  text: string,
  format: EntityFormat,
  scope: EntityScope
): string {
  if (!text) return '';

  let result = '';

  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) continue;

    const isSpecial = SPECIAL_CHARS.has(char);
    const shouldEncode =
      scope === 'special' ? isSpecial : isSpecial || codePoint > 127;

    if (!shouldEncode) {
      result += char;
      continue;
    }

    if (format === 'named') {
      const named = NAMED_ENTITIES[char];
      if (named) {
        result += named;
      } else {
        // Fallback to decimal entity if no named entity is defined
        result += `&#${codePoint};`;
      }
    } else if (format === 'decimal') {
      result += `&#${codePoint};`;
    } else if (format === 'hex') {
      result += `&#x${codePoint.toString(16).toUpperCase()};`;
    }
  }

  return result;
}

/**
 * Decodes HTML entities (named, decimal, hex) back to human-readable characters
 */
export function decodeHtmlEntities(text: string): {
  result: string;
  doubleEscaped: boolean;
} {
  if (!text) return { result: '', doubleEscaped: false };

  const result = text.replace(ENTITY_REGEX, (match, entity) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const hex = entity.slice(2);
      const code = parseInt(hex, 16);
      if (isNaN(code) || code < 0 || code > 0x10ffff) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }

    if (entity.startsWith('#')) {
      const dec = entity.slice(1);
      const code = parseInt(dec, 10);
      if (isNaN(code) || code < 0 || code > 0x10ffff) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }

    const namedChar = REVERSE_NAMED_ENTITIES[entity];
    return namedChar !== undefined ? namedChar : match;
  });

  // Check if output still contains HTML entities (suggesting double-escaping)
  const doubleEscaped = ENTITY_REGEX.test(result);
  ENTITY_REGEX.lastIndex = 0; // reset regex state

  return { result, doubleEscaped };
}
