'use client';

import type { MouseEvent } from 'react';
import type { FileTreeNode } from './types';

import { ChevronDown, ChevronRight, Download, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import {
  formatFileSize,
  calculateCompressionRatio,
  getFileIconConfig,
  getExtension,
  TEXT_EXTENSIONS,
  IMAGE_EXTENSIONS,
} from '@/utils/file-utils';

interface FileTreeItemProps<T = unknown> {
  node: FileTreeNode<T>;
  depth: number;
  isExpanded: boolean;
  onToggleFolder: (path: string) => void;
  onPreview?: (node: FileTreeNode<T>) => void;
  onDownload?: (node: FileTreeNode<T>) => void;
}

export function FileTreeItem<T = unknown>({
  node,
  depth,
  isExpanded,
  onToggleFolder,
  onPreview,
  onDownload,
}: FileTreeItemProps<T>) {
  const isDir = node.isDirectory;
  const ext = node.extension || getExtension(node.name);
  const iconConfig = getFileIconConfig(ext, isDir, isExpanded);
  const IconComponent = iconConfig.icon;

  const canPreview =
    !isDir &&
    !!onPreview &&
    (TEXT_EXTENSIONS.has(ext) || IMAGE_EXTENSIONS.has(ext));

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
        'hover:bg-slate-100/80 dark:hover:bg-neutral-800/60',
        depth > 0 && 'border-l border-slate-200/50 dark:border-neutral-800/50',
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

        {/* Action Buttons */}
        {!isDir && (
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            {canPreview && (
              <Button
                variant="ghost"
                size="xs"
                rounded="md"
                icon={Eye}
                onClick={() => onPreview?.(node)}
                title="Preview file content"
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
