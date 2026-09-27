/**
 * UUID generation engine supporting RFC 4122 v4 and RFC 9562 v7.
 * Uses Web Crypto CSPRNG (crypto.getRandomValues & crypto.randomUUID).
 */

function getRandomBytes(count: number): Uint8Array {
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a standard RFC 4122 UUID v4.
 */
export function generateUUIDv4(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  // Fallback using crypto.getRandomValues
  const bytes = getRandomBytes(16);
  // Set version to 4 (0100)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant to RFC 4122 (10xx)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Generate a compact UUID v4 without hyphens (32 hex characters).
 */
export function generateUUIDv4Compact(): string {
  return generateUUIDv4().replace(/-/g, '');
}

/**
 * Generate an RFC 9562 UUID v7.
 * Layout:
 * - 48-bit unsigned integer: Unix timestamp in milliseconds
 * - 4-bit version field: 7 (0b0111)
 * - 12-bit pseudorandom data: rand_a
 * - 2-bit variant field: RFC 4122 (0b10)
 * - 62-bit pseudorandom data: rand_b
 */
export function generateUUIDv7(timestampMs?: number): string {
  const time = timestampMs ?? Date.now();
  const bytes = getRandomBytes(16);

  // Write 48-bit timestamp (Big-endian)
  bytes[0] = Math.floor(time / 0x10000000000) & 0xff;
  bytes[1] = Math.floor(time / 0x100000000) & 0xff;
  bytes[2] = Math.floor(time / 0x1000000) & 0xff;
  bytes[3] = Math.floor(time / 0x10000) & 0xff;
  bytes[4] = Math.floor(time / 0x100) & 0xff;
  bytes[5] = time & 0xff;

  // Set version 7 in high nibble of byte 6 (0111_xxxx)
  bytes[6] = (bytes[6] & 0x0f) | 0x70;

  // Set variant 10xx_xxxx in high bits of byte 8
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
