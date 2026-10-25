import type {
  FormatOptions,
  HexBinaryResult,
  HexCase,
  InputMode,
} from '../types';

/**
 * Parses raw text input into a Uint8Array using standard UTF-8 encoding
 */
export function parseTextInput(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/**
 * Parses Hexadecimal string into a Uint8Array with noise tolerance (0x, \\x, spaces, commas, colons)
 */
export function parseHexInput(hex: string): Uint8Array {
  // Strip non-hexadecimal characters
  let clean = hex.replace(/0x|\\x|[^0-9a-fA-F]/g, '');

  if (clean.length === 0) {
    return new Uint8Array(0);
  }

  // If odd length, prefix with '0' to align bytes
  if (clean.length % 2 !== 0) {
    clean = `0${clean}`;
  }

  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }

  return bytes;
}

/**
 * Parses Binary bit stream string into a Uint8Array with whitespace tolerance
 */
export function parseBinaryInput(binary: string): Uint8Array {
  // Keep only 0 and 1
  let clean = binary.replace(/[^01]/g, '');

  if (clean.length === 0) {
    return new Uint8Array(0);
  }

  // Pad leading zeroes if not a multiple of 8
  const remainder = clean.length % 8;
  if (remainder !== 0) {
    clean = '0'.repeat(8 - remainder) + clean;
  }

  const bytes = new Uint8Array(clean.length / 8);
  for (let i = 0; i < clean.length; i += 8) {
    bytes[i / 8] = parseInt(clean.slice(i, i + 8), 2);
  }

  return bytes;
}

/**
 * Parses Decimal byte array string (e.g. "72, 101, 108" or "[72, 101, 108]") into a Uint8Array
 */
export function parseDecimalInput(decimal: string): Uint8Array {
  const tokens = decimal
    .replace(/[\[\]]/g, '')
    .split(/[\s,;]+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return new Uint8Array(0);
  }

  const result: number[] = [];
  for (const token of tokens) {
    const num = parseInt(token, 10);
    if (!isNaN(num) && num >= 0 && num <= 255) {
      result.push(num);
    }
  }

  return new Uint8Array(result);
}

/**
 * Formats a byte buffer into a Hexadecimal representation based on options
 */
export function formatHex(bytes: Uint8Array, options: FormatOptions): string {
  if (bytes.length === 0) return '';

  const hexBytes: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    let h = bytes[i].toString(16).padStart(2, '0');
    if (options.hexCase === 'uppercase') {
      h = h.toUpperCase();
    } else {
      h = h.toLowerCase();
    }

    if (options.delimiter === '0x-prefix') {
      hexBytes.push(`0x${h}`);
    } else {
      hexBytes.push(h);
    }
  }

  switch (options.delimiter) {
    case 'none':
      return hexBytes.join('');
    case 'comma':
      return hexBytes.join(', ');
    case 'colon':
      return hexBytes.join(':');
    case '0x-prefix':
      return hexBytes.join(', ');
    case 'space':
    default:
      return hexBytes.join(' ');
  }
}

/**
 * Formats a byte buffer into an 8-bit binary bit stream based on delimiter options
 */
export function formatBinary(
  bytes: Uint8Array,
  options?: FormatOptions
): string {
  if (bytes.length === 0) return '';
  const bitStrings: string[] = [];
  const is0b = options?.delimiter === '0x-prefix';

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i].toString(2).padStart(8, '0');
    bitStrings.push(is0b ? `0b${b}` : b);
  }

  switch (options?.delimiter) {
    case 'none':
      return bitStrings.join('');
    case 'comma':
      return bitStrings.join(', ');
    case 'colon':
      return bitStrings.join(':');
    case '0x-prefix':
      return bitStrings.join(', ');
    case 'space':
    default:
      return bitStrings.join(' ');
  }
}

/**
 * Formats a byte buffer into decimal integers based on delimiter options
 */
export function formatDecimal(
  bytes: Uint8Array,
  options?: FormatOptions
): string {
  if (bytes.length === 0) return '';
  const values = Array.from(bytes).map((b) => b.toString(10));

  switch (options?.delimiter) {
    case 'space':
      return values.join(' ');
    case 'colon':
      return values.join(':');
    case 'none':
      // Numbers cannot be concatenated without losing byte boundaries, fallback to space
      return values.join(' ');
    case '0x-prefix':
    case 'comma':
    default:
      return values.join(', ');
  }
}

/**
 * Formats a byte buffer into C/C++ array initialization syntax
 */
export function formatCArray(bytes: Uint8Array, hexCase: HexCase): string {
  if (bytes.length === 0) return '{ }';
  const hexParts = Array.from(bytes).map((b) => {
    let h = b.toString(16).padStart(2, '0');
    if (hexCase === 'uppercase') h = h.toUpperCase();
    return `0x${h}`;
  });
  return `{ ${hexParts.join(', ')} }`;
}

/**
 * Formats a byte buffer into Python / Go raw bytes literal syntax
 */
export function formatPythonBytes(bytes: Uint8Array, hexCase: HexCase): string {
  if (bytes.length === 0) return 'b""';
  const parts = Array.from(bytes).map((b) => {
    let h = b.toString(16).padStart(2, '0');
    if (hexCase === 'uppercase') h = h.toUpperCase();
    return `\\x${h}`;
  });
  return `b"${parts.join('')}"`;
}

/**
 * Formats a byte buffer into UTF-8 text representation with fallback
 */
export function formatText(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return '';
  }
}

/**
 * Master conversion function
 */
export function convertPayload(
  rawInput: string,
  mode: InputMode,
  options: FormatOptions
): HexBinaryResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    const emptyBytes = new Uint8Array(0);
    return {
      bytes: emptyBytes,
      text: '',
      hex: '',
      binary: '',
      decimal: '',
      cArray: '{ }',
      pythonBytes: 'b""',
      byteLength: 0,
      bitLength: 0,
      charCount: 0,
    };
  }

  let bytes: Uint8Array;
  switch (mode) {
    case 'text':
      bytes = parseTextInput(rawInput); // Preserve verbatim whitespace in text mode
      break;
    case 'hex':
      bytes = parseHexInput(trimmed);
      break;
    case 'binary':
      bytes = parseBinaryInput(trimmed);
      break;
    case 'decimal':
      bytes = parseDecimalInput(trimmed);
      break;
  }

  const text = formatText(bytes);
  const hex = formatHex(bytes, options);
  const binary = formatBinary(bytes, options);
  const decimal = formatDecimal(bytes, options);
  const cArray = formatCArray(bytes, options.hexCase);
  const pythonBytes = formatPythonBytes(bytes, options.hexCase);

  return {
    bytes,
    text,
    hex,
    binary,
    decimal,
    cArray,
    pythonBytes,
    byteLength: bytes.length,
    bitLength: bytes.length * 8,
    charCount: Array.from(text).length,
  };
}
