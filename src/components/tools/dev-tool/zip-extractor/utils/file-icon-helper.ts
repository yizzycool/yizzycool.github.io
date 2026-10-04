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

import { IMAGE_EXTENSIONS, TEXT_EXTENSIONS } from '../constants';

export interface FileIconConfig {
  icon: LucideIcon;
  colorClass: string;
}

const ARCHIVE_EXTS = new Set(['zip', 'tar', 'gz', 'bz2', '7z', 'rar', 'tgz']);
const SPREADSHEET_EXTS = new Set(['csv', 'tsv', 'xls', 'xlsx', 'ods']);
const AUDIO_EXTS = new Set(['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv']);

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
      colorClass: 'text-pink-500 dark:text-pink-400',
    };
  }

  if (VIDEO_EXTS.has(ext)) {
    return {
      icon: FileVideo,
      colorClass: 'text-orange-500 dark:text-orange-400',
    };
  }

  if (TEXT_EXTENSIONS.has(ext)) {
    // Determine whether it's code or documentation/plain text
    if (['txt', 'log', 'md', 'markdown'].includes(ext)) {
      return {
        icon: FileText,
        colorClass: 'text-sky-500 dark:text-sky-400',
      };
    }
    return {
      icon: FileCode,
      colorClass: 'text-blue-500 dark:text-blue-400',
    };
  }

  return {
    icon: File,
    colorClass: 'text-slate-400 dark:text-slate-500',
  };
}
