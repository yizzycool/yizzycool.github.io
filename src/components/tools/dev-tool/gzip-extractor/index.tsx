'use client';

import type { ReactNode } from 'react';
import type { InputSource, TarFileEntry } from './types';

import {
  Download,
  FileArchive,
  FileCode,
  FolderMinus,
  FolderPlus,
} from 'lucide-react';

import {
  CopyAction,
  DeleteAction,
  SampleAction,
} from '@/components/shared/action-button';
import {
  FilePreviewBody,
  FilePreviewModal,
  FilePreviewPane,
} from '@/components/shared/file-preview-modal';
import { FileTree } from '@/components/shared/file-tree';
import ExecuteBar from '@/components/tools/common/execute-bar';
import HeaderBlock from '@/components/tools/common/header-block';
import LabelBar from '@/components/tools/common/label-bar';
import SectionGap from '@/components/tools/common/section-gap';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { SearchInput } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import {
  formatFileSize,
  getExtension,
  SYNTAX_LANGUAGE_MAP,
} from '@/utils/file-utils';

import GzipDropzone from './gzip-dropzone';
import GzipSummaryBar from './gzip-summary-bar';
import useGzipExtractor from './hooks/use-gzip-extractor';

const INPUT_SOURCE_TABS: InputSource[] = ['file', 'text'];

const INPUT_SOURCE_TAB_LABELS: Record<InputSource, ReactNode> = {
  file: (
    <span className="flex items-center gap-1.5">
      <FileArchive className="h-3.5 w-3.5" />
      <span>GZIP File (.gz, .tgz)</span>
    </span>
  ),
  text: (
    <span className="flex items-center gap-1.5">
      <FileCode className="h-3.5 w-3.5" />
      <span>Base64 / Hex Stream</span>
    </span>
  ),
};

const MAX_HIGHLIGHTED_TEXT_LENGTH = 100_000;

function inferTextLanguage(fileName: string, content: string): string {
  const ext = getExtension(fileName);
  const mapped = SYNTAX_LANGUAGE_MAP[ext];
  if (mapped && mapped !== 'text') return mapped;

  const trimmed = content.trim();
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      return 'text';
    }
  }

  return mapped || 'text';
}

export default function GzipExtractor() {
  const {
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
    onDownloadResultFile,
    onToggleFolder,
    onExpandAll,
    onCollapseAll,
    onPreviewTarEntry,
    onOpenPreviewModal,
    onClosePreview,
    onDownloadTarEntry,
  } = useGzipExtractor();

  const textLanguage =
    result && !result.isTar && result.isText && result.textContent !== null
      ? inferTextLanguage(result.fileName, result.textContent)
      : 'text';

  return (
    <div>
      <HeaderBlock
        customShortcuts={[
          TOOL_HOTKEYS.process,
          TOOL_HOTKEYS.copy,
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap size="sm" />

      <div className="flex items-center justify-between">
        <Tabs<InputSource>
          tabs={INPUT_SOURCE_TABS}
          activeTab={inputSource}
          onChange={setInputSource}
          tabLabels={INPUT_SOURCE_TAB_LABELS}
          variant="segment"
          size="sm"
          rounded="lg"
        />
      </div>

      <SectionGap size="sm" />

      {inputSource === 'file' && (
        <GzipDropzone
          file={file}
          isProcessing={isProcessing}
          onFileSelect={handleDecompressFile}
          onClear={onClear}
          onLoadSample={onLoadSampleFile}
        />
      )}

      {inputSource === 'text' && (
        <div className="flex flex-col gap-3">
          <LabelBar
            label="Compressed String Input"
            description="Paste Base64 or Hex encoded GZIP / Zlib / Deflate binary stream."
            actions={
              <div className="flex items-center gap-2">
                <SampleAction
                  rounded="lg"
                  label="Sample Base64"
                  onClick={onLoadSampleText}
                />
                <DeleteAction
                  variant="ghost"
                  bordered
                  rounded="lg"
                  label="Clear"
                  onClick={onClear}
                />
              </div>
            }
          />

          <Textarea
            ref={textInputRef}
            placeholder="Paste Base64 (e.g. H4sIC... or 1f8b08...) or Hex string here..."
            value={textInput}
            onChange={onTextInputChange}
            rows={5}
            className="font-mono text-xs"
          />

          <ExecuteBar
            label={isProcessing ? 'Decompressing...' : 'Decompress String'}
            onClick={() => handleDecompressText()}
            disabled={!textInput.trim() || isProcessing}
            text={textInput}
          />
        </div>
      )}

      <ErrorMessage message={error} className="mt-3" />

      {result && (
        <div className="mt-6 flex flex-col gap-5">
          <GzipSummaryBar summary={result.summary} />

          {/* Result Type 1: Master-Detail TAR Archive Explorer */}
          {result.isTar && result.tarTree && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchInput
                  placeholder="Filter tar archive entries by name or path..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  hotkey="/"
                  containerClassName="flex-1"
                  className="text-xs"
                />

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    rounded="lg"
                    icon={FolderPlus}
                    onClick={onExpandAll}
                    title="Expand all directories"
                  >
                    Expand All
                  </Button>

                  <Button
                    variant="outline"
                    size="xs"
                    rounded="lg"
                    icon={FolderMinus}
                    onClick={onCollapseAll}
                    title="Collapse all directories"
                  >
                    Collapse
                  </Button>

                  <Button
                    variant="primary"
                    size="xs"
                    rounded="lg"
                    icon={Download}
                    onClick={onDownloadResultFile}
                    title="Download raw decompressed TAR archive"
                  >
                    Download .tar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-5 xl:col-span-4">
                  <FileTree<TarFileEntry>
                    tree={result.tarTree}
                    searchQuery={searchQuery}
                    expandedFolders={expandedFolders}
                    selectedPath={preview.entry?.path ?? null}
                    onToggleFolder={onToggleFolder}
                    onSelect={(node) => {
                      if (node.entry) onPreviewTarEntry(node.entry);
                    }}
                    onPreview={(node) => {
                      if (node.entry) {
                        onPreviewTarEntry(node.entry, { openModal: true });
                      }
                    }}
                    onDownload={(node) => {
                      if (node.entry) onDownloadTarEntry(node.entry);
                    }}
                    className="max-h-[600px] overflow-y-auto"
                  />
                </div>

                <div className="hidden lg:col-span-7 lg:block xl:col-span-8">
                  <FilePreviewPane
                    className="h-[600px]"
                    fileName={preview.entry?.name ?? ''}
                    fileSize={preview.entry?.size ?? 0}
                    filePath={preview.entry?.path}
                    extension={preview.entry?.extension}
                    isText={preview.isText}
                    isImage={preview.isImage}
                    textContent={preview.textContent}
                    imageUrl={preview.imageUrl}
                    syntaxLanguage={preview.syntaxLanguage}
                    onDownload={
                      preview.entry
                        ? () => onDownloadTarEntry(preview.entry!)
                        : undefined
                    }
                    onExpandModal={
                      preview.entry ? onOpenPreviewModal : undefined
                    }
                    emptyTitle="Select a TAR entry to inspect"
                    emptyDescription="Click any text, code, config, or image entry in the TAR tree on the left to preview it inline."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Result Type 2: Decompressed Text / JSON / Code Preview */}
          {!result.isTar && result.isText && result.textContent !== null && (
            <div className="flex flex-col gap-2">
              <LabelBar
                label="Decompressed Text Content"
                description={`Format: UTF-8 (${textLanguage.toUpperCase()}) • ${formatFileSize(result.decompressedData.length)}`}
                actions={
                  <div className="flex items-center gap-2">
                    <CopyAction
                      rounded="lg"
                      label="Copy Text"
                      content={result.textContent}
                      successToast="Decompressed text copied to clipboard!"
                    />
                    <Button
                      variant="outline"
                      size="xs"
                      rounded="lg"
                      icon={Download}
                      onClick={onDownloadResultFile}
                      title="Download decompressed file"
                    >
                      Download File
                    </Button>
                  </div>
                }
              />

              {result.textContent.length <= MAX_HIGHLIGHTED_TEXT_LENGTH ? (
                <FilePreviewBody
                  fileName={result.fileName}
                  fileSize={result.decompressedData.length}
                  isText
                  textContent={result.textContent}
                  syntaxLanguage={textLanguage}
                  codeMaxHeightClassName="[&_pre>div>div:nth-child(2)]:max-h-[480px]"
                />
              ) : (
                <div className="backdrop-blur-xs shadow-xs relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/70 dark:border-neutral-800/80 dark:bg-neutral-900/70">
                  <pre className="max-h-96 overflow-auto p-4 font-mono text-xs text-slate-800 selection:bg-blue-500/20 dark:text-slate-200">
                    {result.textContent}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Result Type 3: Binary File Download Card */}
          {!result.isTar && !result.isText && (
            <div className="flex flex-col gap-2">
              <LabelBar
                label="Decompressed Binary File"
                description="Binary file detected (not plain text or tar). You can download the decompressed payload directly."
              />
              <div className="backdrop-blur-xs flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/60 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60">
                <div className="flex items-center gap-3">
                  <FileArchive className="h-6 w-6 text-blue-500" />
                  <div>
                    <div className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {result.fileName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Decompressed Size:{' '}
                      {formatFileSize(result.decompressedData.length)}
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  rounded="lg"
                  icon={Download}
                  onClick={onDownloadResultFile}
                >
                  Download {result.fileName}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <FilePreviewModal
        isOpen={preview.isModalOpen}
        onClose={onClosePreview}
        fileName={preview.entry?.name ?? ''}
        fileSize={preview.entry?.size ?? 0}
        filePath={preview.entry?.path}
        extension={preview.entry?.extension}
        isText={preview.isText}
        isImage={preview.isImage}
        textContent={preview.textContent}
        imageUrl={preview.imageUrl}
        syntaxLanguage={preview.syntaxLanguage}
        onDownload={
          preview.entry ? () => onDownloadTarEntry(preview.entry!) : undefined
        }
      />
    </div>
  );
}
