import type { RefObject } from 'react';
import { Download, FolderMinus, FolderPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input';

interface ZipToolbarProps {
  searchInputRef?: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onDownloadAll: () => void;
  isDownloadingAll: boolean;
  totalFilteredCount: number;
  totalFiles: number;
}

export default function ZipToolbar({
  searchInputRef,
  searchQuery,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
  onDownloadAll,
  isDownloadingAll,
  totalFilteredCount,
  totalFiles,
}: ZipToolbarProps) {
  const isFiltering = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input Box */}
      <SearchInput
        ref={searchInputRef}
        placeholder="Filter files by name or folder path..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        hotkey="/"
        containerClassName="flex-1"
        className="text-xs"
      />

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {isFiltering && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {totalFilteredCount} of {totalFiles}
          </span>
        )}

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
          onClick={onDownloadAll}
          disabled={isDownloadingAll}
          title="Download all files in this archive"
        >
          {isDownloadingAll ? 'Extracting...' : 'Extract All'}
        </Button>
      </div>
    </div>
  );
}
