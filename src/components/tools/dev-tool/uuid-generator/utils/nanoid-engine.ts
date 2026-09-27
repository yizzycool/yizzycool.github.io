/**
 * NanoID generator using Web Crypto CSPRNG with uniform distribution masking.
 * Zero external dependencies.
 */

import { ALPHABET_DEFINITIONS } from '../constants';

/**
 * Generate a NanoID string using custom alphabet and length.
 * Implements uniform distribution bitmasking to prevent modulo bias.
 */
export function customNanoID(
  alphabet: string = ALPHABET_DEFINITIONS['url-safe'],
  size: number = 21
): string {
  if (!alphabet || alphabet.length < 2) {
    alphabet = ALPHABET_DEFINITIONS['url-safe'];
  }
  const alphabetLen = alphabet.length;
  // Calculate mask: nearest power of 2 minus 1
  const mask = (2 << (31 - Math.clz32((alphabetLen - 1) | 1))) - 1;
  // Step size calculation to minimize calls to getRandomValues
  const step = Math.ceil((1.6 * mask * size) / alphabetLen);

  let id = '';
  while (true) {
    const bytes = new Uint8Array(step);
    crypto.getRandomValues(bytes);

    for (let i = 0; i < step; i++) {
      const byte = bytes[i] & mask;
      if (byte < alphabetLen) {
        id += alphabet[byte];
        if (id.length === size) {
          return id;
        }
      }
    }
  }
}

/**
 * Standard 21-character URL-safe NanoID.
 */
export function generateNanoID(size: number = 21): string {
  return customNanoID(ALPHABET_DEFINITIONS['url-safe'], size);
}
