import { BaseBlogData } from './base';
import { BlogArticleData } from './article';

export interface BlogTagData extends BaseBlogData {
  name: string;
  slug: string;
  articles: Array<BlogArticleData>;
}
