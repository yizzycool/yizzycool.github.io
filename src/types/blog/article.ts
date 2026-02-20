import type { BaseBlogData } from './base';
import type { BlogAuthorData } from './author';
import type { BlogCategoryData } from './category';
import type { BlogMediaData } from './media';
import type { BlogTagData } from './tag';
import type { BlogCollectionData } from './collection';

export interface BlogArticleData extends BaseBlogData {
  title: string;
  shortTitle: string;
  description: string;
  content: string;
  slug: string;
  avatar: BlogMediaData;
  author: BlogAuthorData;
  tags: Array<BlogTagData>;
  category: BlogCategoryData;
  banner: BlogMediaData;
  readTime: number;
  metaDescription: string;
  ogDescription: string;
  twitterDescription: string;
  collection: BlogCollectionData;
}
