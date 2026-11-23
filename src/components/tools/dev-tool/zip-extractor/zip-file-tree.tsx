'use client';

import type { ZipFileEntry, ZipTreeNode } from './types';

import { FileTree } from '@/components/shared/file-tree';

interface ZipFileTreeProps {
  tree: ZipTreeNode;
  searchQuery: string;
  expandedFolders: Set<string>;
  selectedPath?: string | null;
  onToggleFolder: (path: string) => void;
  onSelect?: (entry: ZipFileEntry) => void;
  onPreview: (entry: ZipFileEntry) => void;
  onDownload: (entry: ZipFileEntry) => void;
  className?: string;
}

export default function ZipFileTree({
  tree,
  searchQuery,
  expandedFolders,
  selectedPath,
  onToggleFolder,
  onSelect,
  onPreview,
  onDownload,
  className,
}: ZipFileTreeProps) {
  return (
    <FileTree<ZipFileEntry>
      tree={tree}
      searchQuery={searchQuery}
      expandedFolders={expandedFolders}
      selectedPath={selectedPath}
      onToggleFolder={onToggleFolder}
      onSelect={
        onSelect
          ? (node) => {
              if (node.entry) onSelect(node.entry);
            }
          : undefined
      }
      onPreview={(node) => {
        if (node.entry) onPreview(node.entry);
      }}
      onDownload={(node) => {
        if (node.entry) onDownload(node.entry);
      }}
      emptyText="No files found inside archive"
      className={className}
    />
  );
}
