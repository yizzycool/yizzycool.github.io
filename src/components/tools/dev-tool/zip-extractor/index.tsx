'use client';

import { FilePreviewPane } from '@/components/shared/file-preview-modal';
import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import { ErrorMessage } from '@/components/ui/error-message';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import useZipExtractor from './hooks/use-zip-extractor';
import ZipDropzone from './zip-dropzone';
import ZipFileTree from './zip-file-tree';
import ZipPreviewModal from './zip-preview-modal';
import ZipSummaryBar from './zip-summary-bar';
import ZipToolbar from './zip-toolbar';

export default function ZipExtractor() {
  const {
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
  } = useZipExtractor();

  const filteredFilesCount = searchQuery.trim()
    ? flatEntries.filter(
        (e) =>
          !e.isDirectory &&
          (e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.path.toLowerCase().includes(searchQuery.toLowerCase()))
      ).length
    : (summary?.totalFiles ?? 0);

  return (
    <div>
      <HeaderBlock
        customShortcuts={[
          { symbol: '/', label: 'Filter Files' },
          { ...TOOL_HOTKEYS.clear, label: 'Clear / Close', hint: '' },
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap size="sm" />

      <ZipDropzone
        file={file}
        isParsing={isParsing}
        onFileSelect={handleFileSelect}
        onClear={handleClear}
        onLoadSample={handleLoadSample}
      />

      <ErrorMessage message={error} className="mt-3" />

      {/* Master-Detail Archive Explorer */}
      {summary && tree && (
        <div className="mt-6 flex flex-col gap-5">
          <ZipSummaryBar summary={summary} />

          <ZipToolbar
            searchInputRef={searchInputRef}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            onDownloadAll={handleDownloadAll}
            isDownloadingAll={isDownloadingAll}
            totalFilteredCount={filteredFilesCount}
            totalFiles={summary.totalFiles}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5 xl:col-span-4">
              <ZipFileTree
                tree={tree}
                searchQuery={searchQuery}
                expandedFolders={expandedFolders}
                selectedPath={previewState.entry?.path ?? null}
                onToggleFolder={handleToggleFolder}
                onSelect={(entry) => handlePreview(entry)}
                onPreview={(entry) => handlePreview(entry, { openModal: true })}
                onDownload={handleDownloadSingle}
                className="max-h-[600px] overflow-y-auto"
              />
            </div>

            <div className="hidden lg:col-span-7 lg:block xl:col-span-8">
              <FilePreviewPane
                className="h-[600px]"
                fileName={previewState.entry?.name ?? ''}
                fileSize={previewState.entry?.size ?? 0}
                filePath={previewState.entry?.path}
                extension={previewState.entry?.extension}
                isLoading={previewState.isLoading}
                isText={previewState.isText}
                isImage={previewState.isImage}
                textContent={previewState.textContent}
                imageUrl={previewState.imageUrl}
                syntaxLanguage={previewState.syntaxLanguage}
                error={previewState.error}
                onDownload={
                  previewState.entry
                    ? () => handleDownloadSingle(previewState.entry!)
                    : undefined
                }
                onExpandModal={
                  previewState.entry ? handleOpenPreviewModal : undefined
                }
                emptyTitle="Select a file to inspect"
                emptyDescription="Click any text, code, config, or image file in the archive tree on the left to preview it inline."
              />
            </div>
          </div>
        </div>
      )}

      <ZipPreviewModal
        preview={previewState}
        onClose={handleClosePreviewModal}
        onDownload={handleDownloadSingle}
      />
    </div>
  );
}
