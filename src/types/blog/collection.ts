import { BaseBlogData } from './base';
import { BlogArticleData } from './article';

export interface BlogCollectionData extends BaseBlogData {
  name: string;
  slug: string;
  articles: Array<BlogArticleData>;
}
