import { BaseBlogData } from './base';
import { BlogArticleData } from './article';

export interface BlogCategoryData extends BaseBlogData {
  name: string;
  slug: string;
  articles: Array<BlogArticleData>;
}
