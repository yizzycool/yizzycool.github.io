import type { FileTreeNode } from '@/components/shared/file-tree';
import type { GzipDecompressResult, GzipSummary, TarFileEntry } from '../types';

import * as fflate from 'fflate';

import { calculateCompressionRatio, getExtension } from '@/utils/file-utils';

/**
 * Extracts original filename from GZIP header (RFC 1952) if FNAME flag is present
 */
export function parseGzipHeaderFilename(data: Uint8Array): string | null {
  if (data.length < 10) return null;
  // Magic bytes check (0x1F, 0x8B)
  if (data[0] !== 0x1f || data[1] !== 0x8b) return null;

  const flg = data[3];
  // FNAME is bit 3 (0x08)
  const hasFileName = (flg & 0x08) !== 0;
  if (!hasFileName) return null;

  let offset = 10;
  // FEXTRA is bit 2 (0x04)
  if ((flg & 0x04) !== 0 && data.length > 12) {
    const extraLen = data[10] | (data[11] << 8);
    offset += 2 + extraLen;
  }

  const nameBytes: number[] = [];
  while (offset < data.length && data[offset] !== 0) {
    nameBytes.push(data[offset]);
    offset++;
  }

  if (nameBytes.length === 0) return null;
  try {
    return new TextDecoder('utf-8').decode(new Uint8Array(nameBytes));
  } catch {
    return null;
  }
}

/**
 * Checks whether a byte buffer contains a POSIX ustar tar archive
 */
export function isTarArchive(data: Uint8Array): boolean {
  if (data.length < 512) return false;
  // 'ustar' signature at offset 257 (5 bytes)
  const magic = String.fromCharCode(
    data[257],
    data[258],
    data[259],
    data[260],
    data[261]
  );
  return magic === 'ustar';
}

/**
 * Parses a TAR archive buffer and builds a hierarchical FileTreeNode tree
 */
export function parseTarArchive(data: Uint8Array): FileTreeNode<TarFileEntry> {
  const root: FileTreeNode<TarFileEntry> = {
    id: 'root',
    name: 'root',
    path: '',
    isDirectory: true,
    size: 0,
    children: [],
  };

  const nodeMap = new Map<string, FileTreeNode<TarFileEntry>>();
  nodeMap.set('', root);

  let offset = 0;
  const decoder = new TextDecoder('utf-8');

  while (offset + 512 <= data.length) {
    // Check if end of archive (two consecutive 512-byte blocks of zeroes)
    const isZeroBlock = data
      .subarray(offset, offset + 512)
      .every((b) => b === 0);
    if (isZeroBlock) break;

    // Read name (0-99)
    let rawName = '';
    const nameBytes = data.subarray(offset, offset + 100);
    const nullIdx = nameBytes.indexOf(0);
    const validNameBytes =
      nullIdx !== -1 ? nameBytes.subarray(0, nullIdx) : nameBytes;
    rawName = decoder.decode(validNameBytes).trim();

    // Prefix for long paths (345-499)
    const prefixBytes = data.subarray(offset + 345, offset + 500);
    const prefixNullIdx = prefixBytes.indexOf(0);
    const validPrefixBytes =
      prefixNullIdx !== -1
        ? prefixBytes.subarray(0, prefixNullIdx)
        : prefixBytes;
    const prefix = decoder.decode(validPrefixBytes).trim();

    const fullPath = prefix ? `${prefix}/${rawName}` : rawName;
    const cleanPath = fullPath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

    // Read size (124-135, octal string)
    const sizeBytes = data.subarray(offset + 124, offset + 136);
    const sizeStr = decoder.decode(sizeBytes).trim();
    const size = parseInt(sizeStr, 8) || 0;

    // Read typeflag (156)
    const typeFlag = String.fromCharCode(data[offset + 156]);
    const isDir =
      typeFlag === '5' || cleanPath.endsWith('/') || fullPath.endsWith('/');

    // File data location
    const dataStart = offset + 512;
    const dataEnd = dataStart + size;
    const fileBytes =
      !isDir && size > 0 ? data.slice(dataStart, dataEnd) : new Uint8Array(0);

    const parts = cleanPath.split('/').filter(Boolean);
    const fileName = parts[parts.length - 1] || 'unnamed';

    const entry: TarFileEntry = {
      path: cleanPath,
      name: fileName,
      isDirectory: isDir,
      size,
      extension: isDir ? '' : getExtension(fileName),
      data: fileBytes,
    };

    // Insert into tree structure
    let currentPath = '';
    let parentNode = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = i === parts.length - 1;

      let currentNode = nodeMap.get(currentPath);
      if (!currentNode) {
        currentNode = {
          id: `tar_${currentPath}`,
          name: part,
          path: currentPath,
          isDirectory: isLast ? isDir : true,
          size: isLast ? size : 0,
          extension: isLast && !isDir ? getExtension(part) : '',
          children: [],
          entry: isLast ? entry : undefined,
        };
        nodeMap.set(currentPath, currentNode);
        parentNode.children.push(currentNode);
      } else if (isLast) {
        currentNode.size = size;
        currentNode.entry = entry;
      }

      parentNode = currentNode;
    }

    // Advance to next 512-byte block
    const paddedSize = Math.ceil(size / 512) * 512;
    offset += 512 + paddedSize;
  }

  // Calculate directory sizes recursively
  function calculateDirSizes(node: FileTreeNode<TarFileEntry>): number {
    if (!node.isDirectory) return node.size;
    let total = 0;
    for (const child of node.children) {
      total += calculateDirSizes(child);
    }
    node.size = total;
    return total;
  }

  calculateDirSizes(root);
  return root;
}

/**
 * Checks if a byte buffer looks like UTF-8 text (no unexpected control/null bytes)
 */
export function isUtf8Text(bytes: Uint8Array): boolean {
  if (bytes.length === 0) return true;
  // Inspect first 2048 bytes
  const sample = bytes.subarray(0, Math.min(bytes.length, 2048));
  for (let i = 0; i < sample.length; i++) {
    const b = sample[i];
    // Check for null byte
    if (b === 0) return false;
  }

  try {
    new TextDecoder('utf-8', { fatal: true }).decode(sample);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert Base64 or Hex string into Uint8Array
 */
export function decodeCompressedString(raw: string): Uint8Array {
  const sanitized = raw.trim().replace(/\s+/g, '');
  if (!sanitized) throw new Error('Input string is empty');

  // Check if Hex: only hex chars, even length, or starts with 1f8b / 78
  const isHex =
    /^[0-9a-fA-F]+$/.test(sanitized) &&
    sanitized.length % 2 === 0 &&
    (sanitized.toLowerCase().startsWith('1f8b') ||
      sanitized.toLowerCase().startsWith('78'));

  if (isHex) {
    const bytes = new Uint8Array(sanitized.length / 2);
    for (let i = 0; i < sanitized.length; i += 2) {
      bytes[i / 2] = parseInt(sanitized.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // Base64 (handle URL-safe Base64 as well)
  let base64 = sanitized.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '='
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  const binaryStr = atob(base64);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

/**
 * Core decompressor: automatically determines algorithm (Gzip, Zlib, Deflate)
 * and analyzes uncompressed content (Tar archive, text, or binary).
 */
export function decompressBuffer(
  compressedBytes: Uint8Array,
  fallbackName = 'extracted-file'
): GzipDecompressResult {
  if (compressedBytes.length === 0) {
    throw new Error('Compressed buffer is empty');
  }

  let decompressed: Uint8Array;
  let algorithm: GzipSummary['algorithm'] = 'unknown';

  // 1. Try GZIP (0x1F, 0x8B)
  const isGzipMagic =
    compressedBytes[0] === 0x1f && compressedBytes[1] === 0x8b;
  let headerFileName: string | null = null;

  if (isGzipMagic) {
    try {
      headerFileName = parseGzipHeaderFilename(compressedBytes);
      decompressed = fflate.gunzipSync(compressedBytes);
      algorithm = 'gzip';
    } catch (_err) {
      // Fallback
    }
  }

  // 2. Try Zlib (0x78)
  if (!decompressed! && compressedBytes[0] === 0x78) {
    try {
      decompressed = fflate.unzlibSync(compressedBytes);
      algorithm = 'zlib';
    } catch (_err) {
      // Fallback
    }
  }

  // 3. Fallbacks: Try gunzip -> unzlib -> inflate
  if (!decompressed!) {
    try {
      decompressed = fflate.gunzipSync(compressedBytes);
      algorithm = 'gzip';
    } catch {
      try {
        decompressed = fflate.unzlibSync(compressedBytes);
        algorithm = 'zlib';
      } catch {
        try {
          decompressed = fflate.inflateSync(compressedBytes);
          algorithm = 'deflate';
        } catch {
          throw new Error(
            'Failed to decompress data: invalid GZIP, Zlib, or Deflate stream format.'
          );
        }
      }
    }
  }

  // Determine file name
  let fileName = headerFileName || fallbackName;
  if (!headerFileName) {
    if (fileName.endsWith('.tar.gz')) {
      fileName = fileName.slice(0, -3);
    } else if (fileName.endsWith('.tgz')) {
      fileName = fileName.replace(/\.tgz$/, '.tar');
    } else if (fileName.endsWith('.gz')) {
      fileName = fileName.slice(0, -3);
    }
  }

  // Check if uncompressed data is a TAR archive
  const isTar = isTarArchive(decompressed);
  let tarTree: FileTreeNode<TarFileEntry> | undefined;

  if (isTar) {
    tarTree = parseTarArchive(decompressed);
  }

  // Check if plain text
  const isText = !isTar && isUtf8Text(decompressed);
  let textContent: string | null = null;

  if (isText) {
    try {
      textContent = new TextDecoder('utf-8').decode(decompressed);
    } catch {
      textContent = null;
    }
  }

  const ratio = calculateCompressionRatio(
    decompressed.length,
    compressedBytes.length
  );

  const summary: GzipSummary = {
    fileName,
    originalSize: decompressed.length,
    compressedSize: compressedBytes.length,
    ratio,
    isTar,
    isText,
    algorithm,
  };

  return {
    fileName,
    decompressedData: decompressed,
    textContent,
    isText,
    isTar,
    summary,
    tarTree,
  };
}

export interface TarArchiveInputItem {
  name: string;
  data: Uint8Array;
  isDir?: boolean;
}

/**
 * Creates a standard POSIX ustar TAR archive from in-memory file entries
 */
export function createTarArchive(items: TarArchiveInputItem[]): Uint8Array {
  const blocks: Uint8Array[] = [];
  const enc = new TextEncoder();

  for (const item of items) {
    const header = new Uint8Array(512);
    const isDir = item.isDir ?? item.name.endsWith('/');
    const cleanName = item.name.replace(/\\/g, '/');

    // 1. File Name (offset 0, max 100 bytes)
    header.set(enc.encode(cleanName).slice(0, 100), 0);

    // 2. File Mode (offset 100, 8 bytes)
    header.set(enc.encode(isDir ? '0000755 ' : '0000644 '), 100);

    // 3. UID & GID (offset 108 & 116, 8 bytes each)
    header.set(enc.encode('0001750 '), 108);
    header.set(enc.encode('0001750 '), 116);

    // 4. File Size (offset 124, 12 bytes octal string)
    const sizeStr =
      (isDir ? 0 : item.data.length).toString(8).padStart(11, '0') + ' ';
    header.set(enc.encode(sizeStr), 124);

    // 5. Modification Time (offset 136, 12 bytes octal)
    const mtime =
      Math.floor(Date.now() / 1000)
        .toString(8)
        .padStart(11, '0') + ' ';
    header.set(enc.encode(mtime), 136);

    // 6. Type flag (offset 156, '0' regular file, '5' directory)
    header[156] = isDir ? 53 : 48;

    // 7. Magic & Version (offset 257, "ustar\0", "00")
    header.set(enc.encode('ustar\0'), 257);
    header.set(enc.encode('00'), 263);

    // 8. Checksum (offset 148, 8 bytes: 6 octal digits + null + space)
    header.set(enc.encode('        '), 148);
    let chk = 0;
    for (let i = 0; i < 512; i++) chk += header[i];
    const chkStr = chk.toString(8).padStart(6, '0') + '\0 ';
    header.set(enc.encode(chkStr), 148);

    blocks.push(header);

    // Append file content if regular file
    if (!isDir && item.data.length > 0) {
      blocks.push(item.data);
      const pad = 512 - (item.data.length % 512);
      if (pad < 512) {
        blocks.push(new Uint8Array(pad));
      }
    }
  }

  // End of archive marker: two consecutive 512-byte zero blocks
  blocks.push(new Uint8Array(512));
  blocks.push(new Uint8Array(512));

  const totalLen = blocks.reduce((acc, b) => acc + b.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const b of blocks) {
    result.set(b, offset);
    offset += b.length;
  }
  return result;
}
