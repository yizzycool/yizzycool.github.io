export interface FileTreeNode<T = unknown> {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  compressedSize?: number;
  extension?: string;
  children: FileTreeNode<T>[];
  data?: T;
  entry?: T;
}

export interface FileTreeProps<T = unknown> {
  tree: FileTreeNode<T>;
  searchQuery?: string;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onPreview?: (node: FileTreeNode<T>) => void;
  onDownload?: (node: FileTreeNode<T>) => void;
  emptyText?: string;
  className?: string;
}
