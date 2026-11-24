export type SidebarScope = 'blog' | 'tools';

export const SIDEBAR_STORAGE_KEYS: Record<SidebarScope, string> = {
  blog: 'yizzypeasy-blog-sidebar-collapsed',
  tools: 'yizzypeasy-tools-sidebar-collapsed',
};

export const SIDEBAR_DATA_ATTRS: Record<SidebarScope, string> = {
  blog: 'data-blog-sidebar',
  tools: 'data-tools-sidebar',
};
