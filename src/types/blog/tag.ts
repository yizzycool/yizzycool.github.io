import { BaseBlogData } from './base';
import { BlogArticleData } from './article';

export interface BlogTagData extends BaseBlogData {
  name: string;
  articles: Array<BlogArticleData>;
}
