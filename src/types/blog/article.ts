import { BaseBlogData } from './base';
import { BlogAuthorData } from './author';
import { BlogCategoryData } from './category';
import { BlogMediaData } from './media';
import { BlogTagData } from './tag';

export interface BlogArticleData extends BaseBlogData {
  title: string;
  description: string;
  content: string;
  slug: string;
  avatar: BlogMediaData;
  author: BlogAuthorData;
  tags: Array<BlogTagData>;
  category: BlogCategoryData;
  banner: BlogMediaData;
  readTime: number;
}
