'use client';

import {
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileQuestion,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import type { ZipFileEntry, ZipTreeNode } from './types';
import { formatFileSize, calculateCompressionRatio } from './utils/zip-core';
import { getFileIconConfig } from './utils/file-icon-helper';
import { IMAGE_EXTENSIONS, TEXT_EXTENSIONS } from './constants';

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
  const isSearching = searchQuery.trim().length > 0;

  // Flatten nodes for search mode or recursive render for normal mode
  const renderTreeNodes = (
    nodes: ZipTreeNode[],
    depth = 0
  ): React.ReactNode => {
    return nodes.map((node) => {
      const isDir = node.isDirectory;
      const isExpanded =
        isDir && (isSearching || expandedFolders.has(node.path));
      const iconConfig = getFileIconConfig(
        node.entry?.extension || '',
        isDir,
        isExpanded
      );
      const IconComponent = iconConfig.icon;

      const canPreview =
        !isDir &&
        node.entry &&
        (TEXT_EXTENSIONS.has(node.entry.extension) ||
          IMAGE_EXTENSIONS.has(node.entry.extension));

      const ratio =
        !isDir && node.entry
          ? calculateCompressionRatio(node.size, node.compressedSize)
          : 0;

      // Filter check when searching
      const matchesSearch =
        !isSearching ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.path.toLowerCase().includes(searchQuery.toLowerCase());

      const hasMatchingChildren =
        isDir && checkHasMatchingChildren(node, searchQuery.toLowerCase());

      if (isSearching && !matchesSearch && !hasMatchingChildren) {
        return null;
      }

      return (
        <div key={node.id} className="flex flex-col">
          {/* Row Item */}
          <div
            className={cn(
              'group flex items-center justify-between gap-2 px-3 py-2 text-xs transition',
              'hover:bg-slate-100/80 dark:hover:bg-neutral-800/60',
              depth > 0 &&
                'border-l border-slate-200/50 dark:border-neutral-800/50',
              isDir && 'cursor-pointer select-none font-medium'
            )}
            style={{ paddingLeft: `${Math.max(12, depth * 20 + 12)}px` }}
            onClick={() => {
              if (isDir) onToggleFolder(node.path);
            }}
          >
            {/* Left: Icon and Name */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {isDir ? (
                <span className="shrink-0 text-slate-400">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              ) : (
                <span className="w-4 shrink-0" />
              )}

              <IconComponent
                className={cn('h-4 w-4 shrink-0', iconConfig.colorClass)}
              />

              <span
                className={cn(
                  'truncate font-mono text-xs',
                  isDir
                    ? 'font-semibold text-slate-800 dark:text-slate-100'
                    : 'text-slate-700 dark:text-slate-300'
                )}
                title={node.path}
              >
                {node.name}
              </span>

              {isDir && (
                <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                  ({node.children.length})
                </span>
              )}
            </div>

            {/* Right: Size, Ratio and Actions */}
            <div
              className="flex shrink-0 items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-mono text-[11px] text-slate-400 dark:text-neutral-500">
                {formatFileSize(node.size)}
              </span>

              {!isDir && ratio > 0 && (
                <Badge
                  variant="neutral"
                  size="xs"
                  rounded="md"
                  className="hidden text-[10px] opacity-80 sm:inline-flex"
                >
                  -{ratio}%
                </Badge>
              )}

              {/* Action Buttons */}
              {!isDir && node.entry && (
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  {canPreview && (
                    <Button
                      variant="ghost"
                      size="xs"
                      rounded="md"
                      icon={Eye}
                      onClick={() => onPreview(node.entry!)}
                      title="Preview file content"
                      className="h-7 w-7 p-0"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="md"
                    icon={Download}
                    onClick={() => onDownload(node.entry!)}
                    title="Extract and download single file"
                    className="h-7 w-7 p-0"
                  />
                </div>
              )}
            </div>
          </div>

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
    <div className="shadow-2xs overflow-hidden rounded-2xl border border-slate-200/90 bg-white/70 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/70">
      {tree.children.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 text-slate-400">
          <FileQuestion className="h-8 w-8 text-slate-300 dark:text-neutral-600" />
          <p className="text-xs">No files found inside archive</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100/60 dark:divide-neutral-800/40">
          {renderTreeNodes(tree.children, 0)}
        </div>
      )}
    </div>
  );
}

function checkHasMatchingChildren(node: ZipTreeNode, query: string): boolean {
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
