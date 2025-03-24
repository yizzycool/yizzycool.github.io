import { BlogArticleData } from './article';
import { BlogAuthorData } from './author';
import { BlogMeta } from './base';
import { BlogCategoryData } from './category';
import { BlogTagData } from './tag';

export interface BlogCategory {
  data: Array<BlogCategoryData>;
  meta: BlogMeta;
}

export interface BlogArticle {
  data: Array<BlogArticleData>;
  meta: BlogMeta;
}

export interface BlogAuthor {
  data: Array<BlogAuthorData>;
  meta: BlogMeta;
}

export interface BlogTag {
  data: Array<BlogTagData>;
  meta: BlogMeta;
}
