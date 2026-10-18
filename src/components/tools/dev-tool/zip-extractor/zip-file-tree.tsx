'use client';

import type { ZipFileEntry, ZipTreeNode } from './types';

import { FileTree } from '@/components/shared/file-tree';

interface ZipFileTreeProps {
  tree: ZipTreeNode;
  searchQuery: string;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onPreview: (entry: ZipFileEntry) => void;
  onDownload: (entry: ZipFileEntry) => void;
}

export default function ZipFileTree({
  tree,
  searchQuery,
  expandedFolders,
  onToggleFolder,
  onPreview,
  onDownload,
}: ZipFileTreeProps) {
  return (
    <FileTree<ZipFileEntry>
      tree={tree}
      searchQuery={searchQuery}
      expandedFolders={expandedFolders}
      onToggleFolder={onToggleFolder}
      onPreview={(node) => {
        if (node.entry) onPreview(node.entry);
      }}
      onDownload={(node) => {
        if (node.entry) onDownload(node.entry);
      }}
      emptyText="No files found inside archive"
    />
  );
}
