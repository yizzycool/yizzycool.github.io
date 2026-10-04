'use client';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import { ErrorMessage } from '@/components/ui/error-message';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import useZipExtractor from './hooks/use-zip-extractor';
import ZipDropzone from './zip-dropzone';
import ZipSummaryBar from './zip-summary-bar';
import ZipToolbar from './zip-toolbar';
import ZipFileTree from './zip-file-tree';
import ZipPreviewModal from './zip-preview-modal';

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
    handleClosePreview,
  } = useZipExtractor();

  // Filtered files count for toolbar
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

      {/* Upload & Dropzone Area */}
      <ZipDropzone
        file={file}
        isParsing={isParsing}
        onFileSelect={handleFileSelect}
        onClear={handleClear}
        onLoadSample={handleLoadSample}
      />

      {/* Error notification if parsing failed */}
      <ErrorMessage message={error} className="mt-3" />

      {/* Archive Explorer View (shown when file is loaded and tree parsed) */}
      {summary && tree && (
        <div className="mt-6 flex flex-col gap-6">
          {/* Statistics summary bar */}
          <ZipSummaryBar summary={summary} />

          <SectionGap size="xs" />

          {/* Action toolbar with search & expand */}
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

          {/* Hierarchical Virtual Directory Tree */}
          <ZipFileTree
            tree={tree}
            searchQuery={searchQuery}
            expandedFolders={expandedFolders}
            onToggleFolder={handleToggleFolder}
            onPreview={handlePreview}
            onDownload={handleDownloadSingle}
          />
        </div>
      )}

      {/* In-Browser Preview Modal */}
      <ZipPreviewModal
        preview={previewState}
        onClose={handleClosePreview}
        onDownload={handleDownloadSingle}
      />
    </div>
  );
}
