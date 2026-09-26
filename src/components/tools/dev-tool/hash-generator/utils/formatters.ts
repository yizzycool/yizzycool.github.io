import type { HashCaseMode } from '../types';

/**
 * Converts a Uint8Array byte buffer to a lowercase hexadecimal string.
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts a Uint8Array byte buffer to a Base64 string.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Encodes a string into UTF-8 Uint8Array bytes.
 */
export function stringToUtf8Bytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/**
 * Parses a hexadecimal string into Uint8Array bytes.
 * Cleans non-hex characters automatically.
 */
export function hexToBytes(hexString: string): Uint8Array {
  const cleanHex = hexString.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(Math.floor(cleanHex.length / 2));
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Formats byte count into human readable file size (e.g. 1.25 MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

/**
 * Adjusts hash casing (lower or upper).
 */
export function applyCaseMode(hash: string, caseMode: HashCaseMode): string {
  return caseMode === 'upper' ? hash.toUpperCase() : hash.toLowerCase();
}
