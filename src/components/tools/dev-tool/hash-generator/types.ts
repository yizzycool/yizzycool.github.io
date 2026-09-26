export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export type HashInputMode = 'text' | 'file';

export type HashEncoding = 'hex' | 'base64';

export type HashCaseMode = 'lower' | 'upper';

export type HmacKeyEncoding = 'utf-8' | 'hex';

export type HashResultItem = {
  algorithm: HashAlgorithm;
  bitLength: number;
  hex: string;
  base64: string;
  error?: string;
};

export type FileMetadata = {
  name: string;
  size: number;
  type: string;
};

export type ChecksumMatchResult = {
  isMatching: boolean;
  matchedAlgorithm?: HashAlgorithm;
};
