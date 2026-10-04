import * as fflate from 'fflate';

import type { ZipFileEntry, ZipSummary, ZipTreeNode } from '../types';

/**
 * Format bytes into human-readable format (B, KB, MB, GB)
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
 * Extract extension from filename
 */
export function getExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()?.toLowerCase() || '';
}

/**
 * Parse ZIP file header and directory tree without loading full content into memory (Lazy metadata parsing)
 */
export async function parseZipArchive(
  file: File
): Promise<{
  entries: ZipFileEntry[];
  summary: ZipSummary;
  tree: ZipTreeNode;
}> {
  const buffer = new Uint8Array(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const entries: ZipFileEntry[] = [];
    const unzipper = new fflate.Unzip();

    unzipper.register(fflate.UnzipInflate);
    unzipper.register(fflate.UnzipPassThrough);

    unzipper.onfile = (zipFile) => {
      // Clean path
      const rawPath = zipFile.name.replace(/\\/g, '/');
      const isDirectory =
        rawPath.endsWith('/') ||
        (zipFile.originalSize === 0 && rawPath.endsWith('/'));
      const cleanPath = isDirectory ? rawPath.replace(/\/+$/, '') : rawPath;

      const pathParts = cleanPath.split('/').filter(Boolean);
      const name = pathParts[pathParts.length - 1] || cleanPath;

      entries.push({
        path: cleanPath,
        name,
        isDirectory,
        size: zipFile.originalSize ?? 0,
        compressedSize: zipFile.size ?? 0,
        date: new Date(),
        extension: isDirectory ? '' : getExtension(name),
      });
    };

    try {
      unzipper.push(buffer, true);

      // Build summary
      let totalFiles = 0;
      let totalFolders = 0;
      let uncompressedSize = 0;
      let compressedSize = 0;

      for (const e of entries) {
        if (e.isDirectory) {
          totalFolders++;
        } else {
          totalFiles++;
          uncompressedSize += e.size;
          compressedSize += e.compressedSize;
        }
      }

      const ratio = calculateCompressionRatio(uncompressedSize, compressedSize);

      const summary: ZipSummary = {
        totalFiles,
        totalFolders,
        uncompressedSize,
        compressedSize,
        ratio,
        fileName: file.name,
        archiveSize: file.size,
      };

      const tree = buildZipTree(entries);

      resolve({ entries, summary, tree });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Build hierarchical tree nodes from flat list of zip entries
 */
export function buildZipTree(entries: ZipFileEntry[]): ZipTreeNode {
  const root: ZipTreeNode = {
    id: 'root',
    name: 'root',
    path: '',
    isDirectory: true,
    size: 0,
    compressedSize: 0,
    children: [],
  };

  for (const entry of entries) {
    const parts = entry.path.split('/').filter(Boolean);
    let currentNode = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const isDir = isLast ? entry.isDirectory : true;
      const currentPath = parts.slice(0, i + 1).join('/');

      let child = currentNode.children.find((c) => c.name === part);
      if (!child) {
        child = {
          id: currentPath,
          name: part,
          path: currentPath,
          isDirectory: isDir,
          size: isLast && !isDir ? entry.size : 0,
          compressedSize: isLast && !isDir ? entry.compressedSize : 0,
          children: [],
          entry: isLast ? entry : undefined,
        };
        currentNode.children.push(child);
      }
      currentNode = child;
    }
  }

  // Sort and calculate folder sizes recursively
  sortAndCalculateSizes(root);
  return root;
}

function sortAndCalculateSizes(node: ZipTreeNode): {
  size: number;
  compressedSize: number;
} {
  if (!node.isDirectory) {
    return { size: node.size, compressedSize: node.compressedSize };
  }

  let folderSize = 0;
  let folderCompressed = 0;

  for (const child of node.children) {
    const childSizes = sortAndCalculateSizes(child);
    folderSize += childSizes.size;
    folderCompressed += childSizes.compressedSize;
  }

  node.size = folderSize;
  node.compressedSize = folderCompressed;

  // Sort folders first, then alphabetically
  node.children.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });

  return { size: folderSize, compressedSize: folderCompressed };
}

/**
 * On-demand extract single file content from the zip buffer
 */
export async function extractSingleFile(
  zipBuffer: Uint8Array,
  targetPath: string
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    let found = false;
    const unzipper = new fflate.Unzip();

    unzipper.register(fflate.UnzipInflate);
    unzipper.register(fflate.UnzipPassThrough);

    unzipper.onfile = (file) => {
      const rawPath = file.name.replace(/\\/g, '/').replace(/\/+$/, '');
      const normTarget = targetPath.replace(/\\/g, '/').replace(/\/+$/, '');

      if (rawPath === normTarget) {
        found = true;
        const chunks: Uint8Array[] = [];
        file.ondata = (err, chunk, final) => {
          if (err) {
            reject(err);
            return;
          }
          if (chunk) chunks.push(chunk);
          if (final) {
            const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
            const combined = new Uint8Array(totalLen);
            let offset = 0;
            for (const c of chunks) {
              combined.set(c, offset);
              offset += c.length;
            }
            resolve(combined);
          }
        };
        file.start();
      }
    };

    try {
      unzipper.push(zipBuffer, true);
      setTimeout(() => {
        if (!found) {
          reject(new Error(`File not found inside ZIP archive: ${targetPath}`));
        }
      }, 500);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Trigger client-side browser file download
 */
export function triggerDownload(
  data: Uint8Array,
  filename: string,
  mimeType = 'application/octet-stream'
): void {
  const blob = new Blob([data as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
