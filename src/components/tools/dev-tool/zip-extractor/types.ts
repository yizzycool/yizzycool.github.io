export interface ZipFileEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  size: number;
  compressedSize: number;
  date: Date;
  extension: string;
  fileData?: Uint8Array;
}

export interface ZipTreeNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  compressedSize: number;
  children: ZipTreeNode[];
  entry?: ZipFileEntry;
}

export interface ZipSummary {
  totalFiles: number;
  totalFolders: number;
  uncompressedSize: number;
  compressedSize: number;
  ratio: number;
  fileName: string;
  archiveSize: number;
}

export interface PreviewState {
  isOpen: boolean;
  entry: ZipFileEntry | null;
  isLoading: boolean;
  isText: boolean;
  isImage: boolean;
  textContent: string | null;
  imageUrl: string | null;
  syntaxLanguage: string;
  error: string | null;
}
