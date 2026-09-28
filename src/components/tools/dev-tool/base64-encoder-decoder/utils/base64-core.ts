import type { Base64Format } from '../types';

/**
 * Encode UTF-8 string to Standard Base64 (safely handles multi-byte unicode without btoa exceptions)
 */
export function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ''
  );
  return btoa(binString);
}

/**
 * Decode Standard Base64 to UTF-8 string (prevents unicode garbled characters from native atob)
 */
export function base64ToUtf8(base64: string): string {
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Convert Standard Base64 to Base64URL
 * - Replace `+` with `-`
 * - Replace `/` with `_`
 * - Strip trailing `=` padding
 */
export function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Convert Base64URL to Standard Base64
 * - Replace `-` with `+`
 * - Replace `_` with `/`
 * - Pad with `=` to reach length divisible by 4
 */
export function base64UrlToBase64(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return base64;
}

/**
 * Encode text with selected Base64 variant format
 */
export function encodeBase64(
  text: string,
  format: Base64Format = 'standard'
): string {
  if (!text) return '';
  const standardBase64 = utf8ToBase64(text);
  return format === 'base64url'
    ? base64ToBase64Url(standardBase64)
    : standardBase64;
}

/**
 * Fault-tolerant decoder supporting both Standard Base64 and Base64URL
 */
export function decodeBase64(input: string): {
  success: boolean;
  result: string;
  error?: string;
} {
  try {
    const cleanInput = input.trim();
    if (!cleanInput) return { success: true, result: '' };

    // Format normalization: convert Base64URL chars to Standard and add missing padding
    const standardBase64 = base64UrlToBase64(cleanInput);
    const decoded = base64ToUtf8(standardBase64);
    return { success: true, result: decoded };
  } catch (_err) {
    return {
      success: false,
      result: '',
      error:
        'Invalid Base64 or Base64URL string. Please check the input characters.',
    };
  }
}
