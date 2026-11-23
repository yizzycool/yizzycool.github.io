'use client';

import type { MouseEvent } from 'react';
import type { FileTreeNode } from './types';

import { ChevronDown, ChevronRight, Download, Eye } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import {
  calculateCompressionRatio,
  formatFileSize,
  getExtension,
  getFileIconConfig,
  IMAGE_EXTENSIONS,
  TEXT_EXTENSIONS,
} from '@/utils/file-utils';

interface FileTreeItemProps<T = unknown> {
  node: FileTreeNode<T>;
  depth: number;
  isExpanded: boolean;
  selectedPath?: string | null;
  onToggleFolder: (path: string) => void;
  onSelect?: (node: FileTreeNode<T>) => void;
  onPreview?: (node: FileTreeNode<T>) => void;
  onDownload?: (node: FileTreeNode<T>) => void;
}

export function FileTreeItem<T = unknown>({
  node,
  depth,
  isExpanded,
  selectedPath = null,
  onToggleFolder,
  onSelect,
  onPreview,
  onDownload,
}: FileTreeItemProps<T>) {
  const isDir = node.isDirectory;
  const isSelected = !isDir && !!selectedPath && selectedPath === node.path;
  const ext = node.extension || getExtension(node.name);
  const iconConfig = getFileIconConfig(ext, isDir, isExpanded);
  const IconComponent = iconConfig.icon;

  const canPreview =
    !isDir &&
    !!onPreview &&
    (TEXT_EXTENSIONS.has(ext) || IMAGE_EXTENSIONS.has(ext));

  const isClickableRow = isDir || !!onSelect || canPreview;

  const ratio =
    !isDir && node.compressedSize !== undefined
      ? calculateCompressionRatio(node.size, node.compressedSize)
      : 0;

  const handleActionClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        'group flex items-center justify-between gap-2 px-3 py-2 text-xs transition',
        isSelected
          ? 'bg-sky-50/90 ring-1 ring-inset ring-sky-200/80 dark:bg-sky-950/40 dark:ring-sky-800/60'
          : 'hover:bg-slate-100/80 dark:hover:bg-neutral-800/60',
        depth > 0 && 'border-l border-slate-200/50 dark:border-neutral-800/50',
        isClickableRow && 'cursor-pointer',
        isDir && 'select-none font-medium'
      )}
      style={{ paddingLeft: `${Math.max(12, depth * 20 + 12)}px` }}
      onClick={() => {
        if (isDir) {
          onToggleFolder(node.path);
        } else if (onSelect) {
          onSelect(node);
        } else if (canPreview) {
          onPreview?.(node);
        }
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
              : isSelected
                ? 'font-semibold text-sky-700 dark:text-sky-300'
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
        onClick={handleActionClick}
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

        {!isDir && (
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            {canPreview && (
              <Button
                variant="ghost"
                size="xs"
                rounded="md"
                icon={Eye}
                onClick={() => onPreview?.(node)}
                title="Open fullscreen preview"
                className="h-7 w-7 p-0"
              />
            )}
            {onDownload && (
              <Button
                variant="ghost"
                size="xs"
                rounded="md"
                icon={Download}
                onClick={() => onDownload?.(node)}
                title="Download single file"
                className="h-7 w-7 p-0"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
