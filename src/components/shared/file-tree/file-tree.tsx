'use client';

import type { ReactNode } from 'react';
import type { FileTreeNode, FileTreeProps } from './types';

import { FileQuestion } from 'lucide-react';

import { cn } from '@/utils/cn';
import { FileTreeItem } from './file-tree-item';

function checkHasMatchingChildren<T>(
  node: FileTreeNode<T>,
  query: string
): boolean {
  for (const child of node.children) {
    if (
      child.name.toLowerCase().includes(query) ||
      child.path.toLowerCase().includes(query)
    ) {
      return true;
    }
    if (child.isDirectory && checkHasMatchingChildren(child, query)) {
      return true;
    }
  }
  return false;
}

export function FileTree<T = unknown>({
  tree,
  searchQuery = '',
  expandedFolders,
  onToggleFolder,
  onPreview,
  onDownload,
  emptyText = 'No files found',
  className = '',
}: FileTreeProps<T>) {
  const isSearching = searchQuery.trim().length > 0;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const renderTreeNodes = (nodes: FileTreeNode<T>[], depth = 0): ReactNode => {
    return nodes.map((node) => {
      const isDir = node.isDirectory;
      const isExpanded =
        isDir && (isSearching || expandedFolders.has(node.path));

      // Filter check when searching
      const matchesSearch =
        !isSearching ||
        node.name.toLowerCase().includes(normalizedQuery) ||
        node.path.toLowerCase().includes(normalizedQuery);

      const hasMatchingChildren =
        isDir && checkHasMatchingChildren(node, normalizedQuery);

      if (isSearching && !matchesSearch && !hasMatchingChildren) {
        return null;
      }

      return (
        <div key={node.id} className="flex flex-col">
          <FileTreeItem<T>
            node={node}
            depth={depth}
            isExpanded={isExpanded}
            onToggleFolder={onToggleFolder}
            onPreview={onPreview}
            onDownload={onDownload}
          />

          {/* Children render */}
          {isDir && isExpanded && node.children.length > 0 && (
            <div className="flex flex-col">
              {renderTreeNodes(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className={cn(
        'shadow-2xs overflow-hidden rounded-2xl border border-slate-200/90 bg-white/70 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/70',
        className
      )}
    >
      {tree.children.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 text-slate-400">
          <FileQuestion className="h-8 w-8 text-slate-300 dark:text-neutral-600" />
          <p className="text-xs">{emptyText}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100/60 dark:divide-neutral-800/40">
          {renderTreeNodes(tree.children, 0)}
        </div>
      )}
    </div>
  );
}
