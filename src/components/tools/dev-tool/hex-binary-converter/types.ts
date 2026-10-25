export type InputMode = 'text' | 'hex' | 'binary' | 'decimal';

export type HexDelimiter = 'space' | 'none' | 'comma' | 'colon' | '0x-prefix';

export type HexCase = 'lowercase' | 'uppercase';

export interface FormatOptions {
  delimiter: HexDelimiter;
  hexCase: HexCase;
}

export interface HexBinaryResult {
  bytes: Uint8Array;
  text: string;
  hex: string;
  binary: string;
  decimal: string;
  cArray: string;
  pythonBytes: string;
  byteLength: number;
  bitLength: number;
  charCount: number;
}

export interface HexBinaryHistoryData {
  input: string;
  inputMode: InputMode;
  preview: string;
  byteLength: number;
}
