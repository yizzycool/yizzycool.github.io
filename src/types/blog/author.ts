import { BaseBlogData } from './base';
import { BlogArticleData } from './article';
import { BlogMediaData } from './media';

export interface BlogAuthorData extends BaseBlogData {
  name: string;
  bio: string;
  avatar: BlogMediaData;
  articles: Array<BlogArticleData>;
}
