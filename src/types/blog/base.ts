export interface BlogMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface BaseBlogData {
  id: number;
  documentId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}
