import type { LucideIcon } from 'lucide-react';

import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
} from 'lucide-react';

export interface FileIconConfig {
  icon: LucideIcon;
  colorClass: string;
}

export const SYNTAX_LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'tsx',
  html: 'html',
  htm: 'html',
  xml: 'xml',
  svg: 'xml',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  markdown: 'markdown',
  py: 'python',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  sql: 'sql',
  rs: 'rust',
  go: 'go',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
  java: 'java',
  php: 'php',
  rb: 'ruby',
  swift: 'swift',
  toml: 'toml',
  ini: 'ini',
  env: 'ini',
  txt: 'text',
  log: 'text',
  csv: 'text',
};

export const TEXT_EXTENSIONS = new Set(Object.keys(SYNTAX_LANGUAGE_MAP));

export const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'ico',
  'bmp',
]);

const ARCHIVE_EXTS = new Set([
  'zip',
  'tar',
  'gz',
  'bz2',
  '7z',
  'rar',
  'tgz',
  'xz',
]);
const SPREADSHEET_EXTS = new Set(['csv', 'tsv', 'xls', 'xlsx', 'ods']);
const AUDIO_EXTS = new Set(['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv']);

/**
 * Format bytes into human-readable string (B, KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val < 10 && i > 0 ? val.toFixed(2) : val.toFixed(1)} ${sizes[i]}`;
}

/**
 * Calculate saved compression ratio percentage
 */
export function calculateCompressionRatio(
  uncompressed: number,
  compressed: number
): number {
  if (uncompressed <= 0 || compressed >= uncompressed) return 0;
  return Math.round(((uncompressed - compressed) / uncompressed) * 1000) / 10;
}

/**
 * Extract lowercase extension from filename
 */
export function getExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()?.toLowerCase() || '';
}

/**
 * Get icon and color class for a given file extension or directory
 */
export function getFileIconConfig(
  extension: string,
  isDirectory = false,
  isOpen = false
): FileIconConfig {
  if (isDirectory) {
    return {
      icon: isOpen ? FolderOpen : Folder,
      colorClass: 'text-amber-500 dark:text-amber-400',
    };
  }

  const ext = extension.toLowerCase();

  if (IMAGE_EXTENSIONS.has(ext)) {
    return {
      icon: FileImage,
      colorClass: 'text-rose-500 dark:text-rose-400',
    };
  }

  if (SPREADSHEET_EXTS.has(ext)) {
    return {
      icon: FileSpreadsheet,
      colorClass: 'text-emerald-500 dark:text-emerald-400',
    };
  }

  if (ARCHIVE_EXTS.has(ext)) {
    return {
      icon: FileArchive,
      colorClass: 'text-purple-500 dark:text-purple-400',
    };
  }

  if (AUDIO_EXTS.has(ext)) {
    return {
      icon: FileAudio,
      colorClass: 'text-violet-500 dark:text-violet-400',
    };
  }

  if (VIDEO_EXTS.has(ext)) {
    return {
      icon: FileVideo,
      colorClass: 'text-pink-500 dark:text-pink-400',
    };
  }

  if (ext === 'txt' || ext === 'log') {
    return {
      icon: FileText,
      colorClass: 'text-slate-500 dark:text-neutral-400',
    };
  }

  if (TEXT_EXTENSIONS.has(ext)) {
    return {
      icon: FileCode,
      colorClass: 'text-sky-500 dark:text-sky-400',
    };
  }

  return {
    icon: File,
    colorClass: 'text-slate-400 dark:text-neutral-500',
  };
}

/**
 * Get image MIME type for a given image file extension
 */
export function getImageMimeType(extension: string): string {
  const ext = extension.toLowerCase();
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'ico') return 'image/x-icon';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return `image/${ext}`;
}
