import type { FormatOptions, HexCase, HexDelimiter, InputMode } from './types';

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  delimiter: 'space',
  hexCase: 'lowercase',
};

export const SAMPLE_INPUTS: Record<InputMode, string> = {
  text: 'Hello, World! 🌍',
  hex: '48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21 20 f0 9f 8c 8d',
  binary:
    '01001000 01100101 01101100 01101100 01101111 00101100 00100000 01010111 01101111 01110010 01101100 01100100 00100001 00100000 11110000 10011111 10001100 10001101',
  decimal:
    '72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33, 32, 240, 159, 140, 141',
};

export const DELIMITER_LABELS: Record<HexDelimiter, string> = {
  space: 'Space',
  none: 'None',
  comma: 'Comma (,)',
  colon: 'Colon (:)',
  '0x-prefix': '0x Prefix',
};

export const HEX_CASE_LABELS: Record<HexCase, string> = {
  lowercase: 'lowercase',
  uppercase: 'UPPERCASE',
};
