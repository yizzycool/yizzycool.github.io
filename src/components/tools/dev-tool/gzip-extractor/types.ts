import type { FileTreeNode } from '@/components/shared/file-tree';

export type InputSource = 'file' | 'text';

export interface GzipSummary {
  fileName: string;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  isTar: boolean;
  isText: boolean;
  algorithm: 'gzip' | 'deflate' | 'zlib' | 'unknown';
}

export interface TarFileEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  size: number;
  extension: string;
  data?: Uint8Array;
}

export interface GzipDecompressResult {
  fileName: string;
  decompressedData: Uint8Array;
  textContent: string | null;
  isText: boolean;
  isTar: boolean;
  summary: GzipSummary;
  tarTree?: FileTreeNode<TarFileEntry>;
}

export interface TarPreviewState {
  isOpen: boolean;
  entry: TarFileEntry | null;
  isText: boolean;
  isImage: boolean;
  textContent: string | null;
  imageUrl: string | null;
  syntaxLanguage: string;
}
