'use client';

import type { ChangeEvent } from 'react';
import type {
  GzipDecompressResult,
  InputSource,
  TarFileEntry,
  TarPreviewState,
} from '../types';
import type { FileTreeNode } from '@/components/shared/file-tree';

import { useState, useCallback, useRef } from 'react';
import * as fflate from 'fflate';

import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';
import {
  TEXT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  SYNTAX_LANGUAGE_MAP,
  getImageMimeType,
} from '@/utils/file-utils';
import { INITIAL_PREVIEW_STATE, SAMPLE_BASE64_GZIP } from '../constants';
import {
  createTarArchive,
  decodeCompressedString,
  decompressBuffer,
} from '../utils/gzip-core';

export default function useGzipExtractor() {
  const [inputSource, setInputSource] = useState<InputSource>('file');
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [result, setResult] = useState<GzipDecompressResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tar archive tree state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [preview, setPreview] = useState<TarPreviewState>(
    INITIAL_PREVIEW_STATE
  );

  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Decompress a File
  const handleDecompressFile = useCallback(async (selectedFile: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const buffer = new Uint8Array(await selectedFile.arrayBuffer());
      const res = decompressBuffer(buffer, selectedFile.name);
      setResult(res);
      setFile(selectedFile);
      setSearchQuery('');
      setExpandedFolders(new Set());
      toast.success('GZIP archive successfully decompressed!');
    } catch (err) {
      const msg = (err as Error).message || 'Failed to decompress GZIP file';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Decompress Text String (Base64 / Hex)
  const handleDecompressText = useCallback(
    (raw: string = textInput) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        setResult(null);
        setError(null);
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        const bytes = decodeCompressedString(trimmed);
        const res = decompressBuffer(bytes, 'decompressed.txt');
        setResult(res);
        setSearchQuery('');
        setExpandedFolders(new Set());
        toast.success('Compressed string successfully decompressed!');
      } catch (err) {
        const msg = (err as Error).message || 'Failed to decompress string';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [textInput]
  );

  // Load sample .gz file
  const onLoadSampleFile = useCallback(async () => {
    setIsProcessing(true);
    try {
      const sampleTar = createTarArchive([
        {
          name: 'README.md',
          data: fflate.strToU8(
            '# GZIP Inspector & Extractor\n\nWelcome to the **100% Client-Side** GZIP Inspector & Extractor!\n\n- Zero Server Upload\n- Fast In-Memory Extraction\n- Built-in Preview for Code & Images'
          ),
        },
        {
          name: 'package.json',
          data: fflate.strToU8(
            JSON.stringify(
              {
                name: 'sample-project',
                version: '1.0.0',
                description: 'A mock project for testing GZIP extraction',
                dependencies: {
                  react: '^19.0.0',
                  next: '^16.0.0',
                },
              },
              null,
              2
            )
          ),
        },
        {
          name: 'src/index.ts',
          data: fflate.strToU8(
            'export function helloWorld(): string {\n  return "Hello from Client-Side GZIP!";\n}\n'
          ),
        },
        {
          name: 'assets/badge.svg',
          data: fflate.strToU8(
            `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="32" viewBox="-1 -1 122 34">
              <rect width="120" height="32" rx="16" fill="rgb(2 44 34 / 60%)" stroke="rgb(16 185 129 / 60%)" stroke-width="1"/>
              <text x="60" y="20" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">100% Private</text>
            </svg>`
          ),
        },
      ]);

      const gzBytes = fflate.gzipSync(sampleTar, {
        filename: 'sample-project.tar',
      });
      const sampleFile = new File(
        [gzBytes as unknown as BlobPart],
        'sample-project.tar.gz',
        {
          type: 'application/gzip',
        }
      );

      await handleDecompressFile(sampleFile);
    } catch (_err) {
      toast.error('Failed to generate sample GZIP file');
    } finally {
      setIsProcessing(false);
    }
  }, [handleDecompressFile]);

  // Load sample text
  const onLoadSampleText = useCallback(() => {
    setTextInput(SAMPLE_BASE64_GZIP);
  }, []);

  // Clear all states
  const onClear = useCallback(() => {
    setFile(null);
    setTextInput('');
    setResult(null);
    setError(null);
    setSearchQuery('');
    setExpandedFolders(new Set());
    setPreview(INITIAL_PREVIEW_STATE);
  }, []);

  // Text input change handler
  const onTextInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setTextInput(val);
      setError(null);
    },
    []
  );

  const onPaste = useCallback(
    (val: string) => {
      setTextInput(val);
      setError(null);
      handleDecompressText(val);
    },
    [handleDecompressText]
  );

  const onGlobalPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onPaste(text);
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    } catch {
      toast.error('Failed to paste from clipboard');
    }
  }, [onPaste]);

  // Copy text result to clipboard
  const onCopyTextResult = useCallback(async () => {
    if (!result?.textContent) return;
    try {
      await navigator.clipboard.writeText(result.textContent);
      toast.success('Decompressed text copied to clipboard!');
    } catch {
      toast.error('Failed to copy text');
    }
  }, [result]);

  // Download entire decompressed result file
  const onDownloadResultFile = useCallback(() => {
    if (!result) return;
    try {
      const blob = new Blob([result.decompressedData as unknown as BlobPart], {
        type: 'application/octet-stream',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${result.fileName}`);
    } catch {
      toast.error('Failed to download file');
    }
  }, [result]);

  // Tar folder toggle
  const onToggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const onExpandAll = useCallback(() => {
    if (!result?.tarTree) return;
    const allPaths = new Set<string>();
    function collect(node: FileTreeNode<TarFileEntry>) {
      if (node.isDirectory && node.path) {
        allPaths.add(node.path);
      }
      for (const child of node.children) {
        collect(child);
      }
    }
    collect(result.tarTree);
    setExpandedFolders(allPaths);
  }, [result]);

  const onCollapseAll = useCallback(() => {
    setExpandedFolders(new Set());
  }, []);

  // Tar entry preview
  const onPreviewTarEntry = useCallback((entry: TarFileEntry) => {
    const ext = entry.extension.toLowerCase();
    const isTxt = TEXT_EXTENSIONS.has(ext);
    const isImg = IMAGE_EXTENSIONS.has(ext);

    let txtContent: string | null = null;
    let imgUrl: string | null = null;

    if (entry.data && isTxt) {
      try {
        txtContent = new TextDecoder('utf-8').decode(entry.data);
      } catch {
        txtContent = null;
      }
    }

    if (entry.data && isImg) {
      const mimeType = getImageMimeType(ext);
      const blob = new Blob([entry.data as unknown as BlobPart], {
        type: mimeType,
      });
      imgUrl = URL.createObjectURL(blob);
    }

    setPreview({
      isOpen: true,
      entry,
      isText: isTxt,
      isImage: isImg,
      textContent: txtContent,
      imageUrl: imgUrl,
      syntaxLanguage: SYNTAX_LANGUAGE_MAP[ext] || 'text',
    });
  }, []);

  const onClosePreview = useCallback(() => {
    if (preview.imageUrl) {
      URL.revokeObjectURL(preview.imageUrl);
    }
    setPreview(INITIAL_PREVIEW_STATE);
  }, [preview.imageUrl]);

  // Download single Tar entry
  const onDownloadTarEntry = useCallback((entry: TarFileEntry) => {
    if (!entry.data) return;
    try {
      const blob = new Blob([entry.data as unknown as BlobPart], {
        type: 'application/octet-stream',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = entry.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${entry.name}`);
    } catch {
      toast.error(`Failed to download ${entry.name}`);
    }
  }, []);

  // Hotkeys
  useToolHotkeys(
    {
      onExecute: () => {
        if (inputSource === 'text') handleDecompressText();
      },
      onClear,
      onPaste: onGlobalPaste,
      onCopy: onCopyTextResult,
    },
    { target: textInputRef }
  );

  return {
    inputSource,
    setInputSource,
    file,
    textInput,
    result,
    isProcessing,
    error,
    searchQuery,
    setSearchQuery,
    expandedFolders,
    preview,
    textInputRef,
    handleDecompressFile,
    handleDecompressText,
    onLoadSampleFile,
    onLoadSampleText,
    onClear,
    onTextInputChange,
    onPaste,
    onCopyTextResult,
    onDownloadResultFile,
    onToggleFolder,
    onExpandAll,
    onCollapseAll,
    onPreviewTarEntry,
    onClosePreview,
    onDownloadTarEntry,
  };
}
