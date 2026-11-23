'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as fflate from 'fflate';

import useToolHotkeys, {
  hasOpenModalDialog,
} from '@/hooks/tools/use-tool-hotkeys';
import { getImageMimeType } from '@/utils/file-utils';
import toast from '@/utils/toast';

import {
  IMAGE_EXTENSIONS,
  INITIAL_PREVIEW_STATE,
  MAX_PREVIEW_TEXT_SIZE,
  SYNTAX_LANGUAGE_MAP,
  TEXT_EXTENSIONS,
} from '../constants';
import type {
  PreviewState,
  ZipFileEntry,
  ZipSummary,
  ZipTreeNode,
} from '../types';
import {
  extractSingleFile,
  parseZipArchive,
  triggerDownload,
} from '../utils/zip-core';

function findFirstPreviewableEntry(
  entries: ZipFileEntry[]
): ZipFileEntry | null {
  const readme = entries.find(
    (entry) => !entry.isDirectory && entry.name.toLowerCase() === 'readme.md'
  );
  if (readme) return readme;

  return (
    entries.find((entry) => {
      if (entry.isDirectory) return false;
      const ext = entry.extension.toLowerCase();
      return TEXT_EXTENSIONS.has(ext) || IMAGE_EXTENSIONS.has(ext);
    }) ?? null
  );
}

export default function useZipExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [zipBuffer, setZipBuffer] = useState<Uint8Array | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [tree, setTree] = useState<ZipTreeNode | null>(null);
  const [flatEntries, setFlatEntries] = useState<ZipFileEntry[]>([]);
  const [summary, setSummary] = useState<ZipSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const [previewState, setPreviewState] = useState<PreviewState>(
    INITIAL_PREVIEW_STATE
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const loadPreviewEntry = useCallback(
    async (buffer: Uint8Array, entry: ZipFileEntry, openModal: boolean) => {
      const ext = entry.extension.toLowerCase();
      const isText = TEXT_EXTENSIONS.has(ext);
      const isImage = IMAGE_EXTENSIONS.has(ext);

      if (!isText && !isImage) {
        setPreviewState({
          isModalOpen: openModal,
          entry,
          isLoading: false,
          isText: false,
          isImage: false,
          textContent: null,
          imageUrl: null,
          syntaxLanguage: 'text',
          error: null,
        });
        return;
      }

      setPreviewState({
        isModalOpen: openModal,
        entry,
        isLoading: true,
        isText,
        isImage,
        textContent: null,
        imageUrl: null,
        syntaxLanguage: SYNTAX_LANGUAGE_MAP[ext] || 'text',
        error: null,
      });

      try {
        const data = await extractSingleFile(buffer, entry.path);

        if (isImage) {
          const mimeType = getImageMimeType(ext);
          const blob = new Blob([data as unknown as BlobPart], {
            type: mimeType,
          });
          const url = URL.createObjectURL(blob);
          setPreviewState((prev) => ({
            ...prev,
            isLoading: false,
            imageUrl: url,
          }));
        } else if (isText) {
          if (entry.size > MAX_PREVIEW_TEXT_SIZE) {
            setPreviewState((prev) => ({
              ...prev,
              isLoading: false,
              error: `File is too large to preview inline (${(entry.size / (1024 * 1024)).toFixed(1)} MB). Please download directly.`,
            }));
            return;
          }

          const decoded = new TextDecoder('utf-8').decode(data);
          setPreviewState((prev) => ({
            ...prev,
            isLoading: false,
            textContent: decoded,
          }));
        }
      } catch (err) {
        setPreviewState((prev) => ({
          ...prev,
          isLoading: false,
          error: (err as Error).message || 'Failed to extract preview data',
        }));
      }
    },
    []
  );

  // Load and parse ZIP file
  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      if (!selectedFile) return;

      if (
        !selectedFile.name.toLowerCase().endsWith('.zip') &&
        selectedFile.type !== 'application/zip'
      ) {
        const msg = 'Please select a valid .zip archive file.';
        setError(msg);
        toast.error(msg);
        return;
      }

      setIsParsing(true);
      setError(null);
      setSearchQuery('');
      setPreviewState(INITIAL_PREVIEW_STATE);

      try {
        const buffer = new Uint8Array(await selectedFile.arrayBuffer());
        setZipBuffer(buffer);
        setFile(selectedFile);

        const parsed = await parseZipArchive(selectedFile);
        setFlatEntries(parsed.entries);
        setSummary(parsed.summary);
        setTree(parsed.tree);

        const initialExpanded = new Set<string>();
        for (const child of parsed.tree.children) {
          if (child.isDirectory) {
            initialExpanded.add(child.path);
          }
        }
        setExpandedFolders(initialExpanded);

        const firstEntry = findFirstPreviewableEntry(parsed.entries);
        if (firstEntry) {
          void loadPreviewEntry(buffer, firstEntry, false);
        }

        toast.success(
          `Loaded ${parsed.summary.totalFiles} files from ZIP archive`
        );
      } catch (err) {
        const msg =
          (err as Error).message || 'Failed to read or parse ZIP file.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsParsing(false);
      }
    },
    [loadPreviewEntry]
  );

  const handleClear = useCallback(() => {
    setFile(null);
    setZipBuffer(null);
    setTree(null);
    setFlatEntries([]);
    setSummary(null);
    setError(null);
    setSearchQuery('');
    setExpandedFolders(new Set());
    setPreviewState(INITIAL_PREVIEW_STATE);
  }, []);

  const handleLoadSample = useCallback(() => {
    try {
      const sampleFiles: Record<string, Uint8Array> = {
        'README.md': fflate.strToU8(
          '# ZIP Inspector & Extractor\n\nWelcome to the **100% Client-Side** ZIP Inspector & Extractor!\n\n- Zero Server Upload\n- Fast In-Memory Extraction\n- Built-in Preview for Code & Images'
        ),
        'package.json': fflate.strToU8(
          JSON.stringify(
            {
              name: 'sample-project',
              version: '1.0.0',
              description: 'A mock project for testing ZIP extraction',
              dependencies: {
                react: '^19.0.0',
                next: '^16.0.0',
              },
            },
            null,
            2
          )
        ),
        'src/index.ts': fflate.strToU8(
          'export function helloWorld(): string {\n  return "Hello from Client-Side ZIP!";\n}\n'
        ),
        'assets/badge.svg': fflate.strToU8(
          `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="32" viewBox="-1 -1 122 34">
            <rect width="120" height="32" rx="16" fill="rgb(2 44 34 / 60%)" stroke="rgb(16 185 129 / 60%)" stroke-width="1"/>
            <text x="60" y="20" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">100% Private</text>
          </svg>`
        ),
      };

      const zipped = fflate.zipSync(sampleFiles);
      const mockFile = new File(
        [zipped as unknown as BlobPart],
        'sample-project.zip',
        {
          type: 'application/zip',
        }
      );

      handleFileSelect(mockFile);
    } catch (_err) {
      toast.error('Failed to create sample ZIP');
    }
  }, [handleFileSelect]);

  const handleToggleFolder = useCallback((folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    if (!tree) return;
    const all = new Set<string>();
    const collect = (node: ZipTreeNode) => {
      if (node.isDirectory && node.path) {
        all.add(node.path);
      }
      node.children.forEach(collect);
    };
    collect(tree);
    setExpandedFolders(all);
  }, [tree]);

  const handleCollapseAll = useCallback(() => {
    setExpandedFolders(new Set());
  }, []);

  const handleDownloadSingle = useCallback(
    async (entry: ZipFileEntry) => {
      if (!zipBuffer) return;
      try {
        const data = await extractSingleFile(zipBuffer, entry.path);
        triggerDownload(data, entry.name);
        toast.success(`Downloaded ${entry.name}`);
      } catch (err) {
        toast.error((err as Error).message || 'Failed to extract file');
      }
    },
    [zipBuffer]
  );

  const handleDownloadAll = useCallback(async () => {
    if (!zipBuffer || !file) return;
    setIsDownloadingAll(true);
    try {
      triggerDownload(zipBuffer, file.name);
      toast.success('Archive downloaded successfully');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to download');
    } finally {
      setIsDownloadingAll(false);
    }
  }, [file, zipBuffer]);

  const handlePreview = useCallback(
    async (entry: ZipFileEntry, options?: { openModal?: boolean }) => {
      if (!zipBuffer) return;
      const shouldOpenModal =
        options?.openModal ??
        (typeof window !== 'undefined' && window.innerWidth < 1024);
      await loadPreviewEntry(zipBuffer, entry, shouldOpenModal);
    },
    [loadPreviewEntry, zipBuffer]
  );

  const handleOpenPreviewModal = useCallback(() => {
    setPreviewState((prev) =>
      prev.entry ? { ...prev, isModalOpen: true } : prev
    );
  }, []);

  const handleClosePreviewModal = useCallback(() => {
    setPreviewState((prev) => ({
      ...prev,
      isModalOpen: false,
    }));
  }, []);

  useEffect(() => {
    const objectUrl = previewState.imageUrl;
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [previewState.imageUrl]);

  // Global shortcut to focus search input on '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || hasOpenModalDialog()) return;

      const active = document.activeElement;
      const isTyping =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.getAttribute('contenteditable') === 'true');

      if (e.key === '/' && !isTyping && !previewState.isModalOpen && file) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, previewState.isModalOpen]);

  useToolHotkeys({
    onClear: () => {
      if (previewState.isModalOpen) {
        handleClosePreviewModal();
      } else if (file) {
        handleClear();
      }
    },
  });

  return {
    file,
    isParsing,
    tree,
    flatEntries,
    summary,
    error,
    searchQuery,
    setSearchQuery,
    expandedFolders,
    isDownloadingAll,
    previewState,
    fileInputRef,
    searchInputRef,
    handleFileSelect,
    handleClear,
    handleLoadSample,
    handleToggleFolder,
    handleExpandAll,
    handleCollapseAll,
    handleDownloadSingle,
    handleDownloadAll,
    handlePreview,
    handleOpenPreviewModal,
    handleClosePreviewModal,
  };
}
