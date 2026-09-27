/**
 * Token and unique identifier engines (Hex, Base64URL, ULID, CUID2-like).
 * Uses Web Crypto CSPRNG.
 */

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Generate a random Hex token with specified byte length.
 * e.g., 16 bytes -> 32 hex chars; 32 bytes -> 64 hex chars.
 */
export function generateHexToken(byteLength: number = 16): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a URL-safe Base64 random token without '=' padding.
 */
export function generateBase64UrlToken(byteLength: number = 24): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate a standard 26-character ULID (Universally Unique Lexicographically Sortable Identifier).
 * - 48-bit Unix timestamp in ms -> 10 chars Crockford Base32
 * - 80-bit random entropy -> 16 chars Crockford Base32
 */
export function generateULID(timestampMs?: number): string {
  const now = timestampMs ?? Date.now();
  let timeStr = '';
  let time = now;

  for (let i = 9; i >= 0; i--) {
    const mod = time % 32;
    timeStr = CROCKFORD_BASE32[mod] + timeStr;
    time = Math.floor(time / 32);
  }

  const randBytes = new Uint8Array(10);
  crypto.getRandomValues(randBytes);
  let randStr = '';
  for (let i = 0; i < 16; i++) {
    const randVal = randBytes[i % randBytes.length] ^ (i * 13);
    randStr += CROCKFORD_BASE32[randVal % 32];
  }

  return timeStr + randStr;
}

/**
 * Generate a 24-character collision-resistant lowercase identifier (CUID2 style).
 */
export function generateCUID2(): string {
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

  // First character is always an ASCII lowercase letter
  const firstByte = new Uint8Array(1);
  crypto.getRandomValues(firstByte);
  let result = LETTERS[firstByte[0] % LETTERS.length];

  const restBytes = new Uint8Array(23);
  crypto.getRandomValues(restBytes);
  for (let i = 0; i < 23; i++) {
    result += ALPHABET[restBytes[i] % ALPHABET.length];
  }

  return result;
}
