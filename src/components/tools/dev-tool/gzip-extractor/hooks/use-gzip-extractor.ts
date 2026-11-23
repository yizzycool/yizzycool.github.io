'use client';

import type { ChangeEvent } from 'react';
import type { FileTreeNode } from '@/components/shared/file-tree';
import type {
  GzipDecompressResult,
  InputSource,
  TarFileEntry,
  TarPreviewState,
} from '../types';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as fflate from 'fflate';

import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import {
  getImageMimeType,
  IMAGE_EXTENSIONS,
  SYNTAX_LANGUAGE_MAP,
  TEXT_EXTENSIONS,
} from '@/utils/file-utils';
import toast from '@/utils/toast';

import { INITIAL_PREVIEW_STATE, SAMPLE_BASE64_GZIP } from '../constants';
import {
  createTarArchive,
  decodeCompressedString,
  decompressBuffer,
} from '../utils/gzip-core';

function findFirstPreviewableTarEntry(
  root: FileTreeNode<TarFileEntry>
): TarFileEntry | null {
  const flat: TarFileEntry[] = [];

  const collect = (node: FileTreeNode<TarFileEntry>) => {
    if (!node.isDirectory && node.entry) {
      flat.push(node.entry);
    }
    for (const child of node.children) {
      collect(child);
    }
  };
  collect(root);

  const readme = flat.find((entry) => entry.name.toLowerCase() === 'readme.md');
  if (readme) return readme;

  return (
    flat.find((entry) => {
      const ext = entry.extension.toLowerCase();
      return TEXT_EXTENSIONS.has(ext) || IMAGE_EXTENSIONS.has(ext);
    }) ?? null
  );
}

function buildTarPreviewState(
  entry: TarFileEntry,
  isModalOpen: boolean
): TarPreviewState {
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

  return {
    isModalOpen,
    entry,
    isText: isTxt,
    isImage: isImg,
    textContent: txtContent,
    imageUrl: imgUrl,
    syntaxLanguage: SYNTAX_LANGUAGE_MAP[ext] || 'text',
  };
}

export default function useGzipExtractor() {
  const [inputSource, setInputSource] = useState<InputSource>('file');
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [result, setResult] = useState<GzipDecompressResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [preview, setPreview] = useState<TarPreviewState>(
    INITIAL_PREVIEW_STATE
  );

  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const applyDecompressedResult = useCallback((res: GzipDecompressResult) => {
    setResult(res);
    setSearchQuery('');

    if (res.isTar && res.tarTree) {
      const topFolders = new Set<string>();
      for (const child of res.tarTree.children) {
        if (child.isDirectory) {
          topFolders.add(child.path);
        }
      }
      setExpandedFolders(topFolders);

      const firstEntry = findFirstPreviewableTarEntry(res.tarTree);
      setPreview(
        firstEntry
          ? buildTarPreviewState(firstEntry, false)
          : INITIAL_PREVIEW_STATE
      );
    } else {
      setExpandedFolders(new Set());
      setPreview(INITIAL_PREVIEW_STATE);
    }
  }, []);

  const handleDecompressFile = useCallback(
    async (selectedFile: File) => {
      setIsProcessing(true);
      setError(null);
      try {
        const buffer = new Uint8Array(await selectedFile.arrayBuffer());
        const res = decompressBuffer(buffer, selectedFile.name);
        setFile(selectedFile);
        applyDecompressedResult(res);
        toast.success('GZIP archive successfully decompressed!');
      } catch (err) {
        const msg = (err as Error).message || 'Failed to decompress GZIP file';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [applyDecompressedResult]
  );

  const handleDecompressText = useCallback(
    (raw: string = textInput) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        setResult(null);
        setError(null);
        setPreview(INITIAL_PREVIEW_STATE);
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        const bytes = decodeCompressedString(trimmed);
        const res = decompressBuffer(bytes, 'decompressed.txt');
        applyDecompressedResult(res);
        toast.success('Compressed string successfully decompressed!');
      } catch (err) {
        const msg = (err as Error).message || 'Failed to decompress string';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [applyDecompressedResult, textInput]
  );

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

  const onLoadSampleText = useCallback(() => {
    setTextInput(SAMPLE_BASE64_GZIP);
  }, []);

  const onClear = useCallback(() => {
    setFile(null);
    setTextInput('');
    setResult(null);
    setError(null);
    setSearchQuery('');
    setExpandedFolders(new Set());
    setPreview(INITIAL_PREVIEW_STATE);
  }, []);

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

  const onCopyTextResult = useCallback(async () => {
    if (!result?.textContent) return;
    try {
      await navigator.clipboard.writeText(result.textContent);
      toast.success('Decompressed text copied to clipboard!');
    } catch {
      toast.error('Failed to copy text');
    }
  }, [result]);

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

  const onPreviewTarEntry = useCallback(
    (entry: TarFileEntry, options?: { openModal?: boolean }) => {
      const shouldOpenModal =
        options?.openModal ??
        (typeof window !== 'undefined' && window.innerWidth < 1024);
      setPreview(buildTarPreviewState(entry, shouldOpenModal));
    },
    []
  );

  const onOpenPreviewModal = useCallback(() => {
    setPreview((prev) => (prev.entry ? { ...prev, isModalOpen: true } : prev));
  }, []);

  const onClosePreview = useCallback(() => {
    setPreview((prev) => ({
      ...prev,
      isModalOpen: false,
    }));
  }, []);

  useEffect(() => {
    const objectUrl = preview.imageUrl;
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [preview.imageUrl]);

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

  useToolHotkeys(
    {
      onExecute: () => {
        if (inputSource === 'text') handleDecompressText();
      },
      onClear: () => {
        if (preview.isModalOpen) {
          onClosePreview();
        } else {
          onClear();
        }
      },
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
    onOpenPreviewModal,
    onClosePreview,
    onDownloadTarEntry,
  };
}
