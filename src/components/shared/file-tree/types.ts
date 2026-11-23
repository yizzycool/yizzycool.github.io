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
  selectedPath?: string | null;
  onToggleFolder: (path: string) => void;
  onSelect?: (node: FileTreeNode<T>) => void;
  onPreview?: (node: FileTreeNode<T>) => void;
  onDownload?: (node: FileTreeNode<T>) => void;
  emptyText?: string;
  className?: string;
}
