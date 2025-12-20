import type { BlogMediaFormat } from '@/types/blog/media';
import urlJoin from 'url-join';
import qs from 'qs';
import _defaults from 'lodash/defaults';

type QueryObject = {
  status: 'published' | 'draft';
  populate?: object;
  fields?: object;
  filters?: object;
  pagination?: object;
};

const defaultPagination = {
  page: 1,
  pageSize: 10,
};

const strapiUtils = {
  toBlogCategoryUrl: (categorySlug: string) => {
    return urlJoin('/blog/category', categorySlug);
  },
  toBlogCategoryArticleUrl: (categorySlug: string, articleSlug: string) => {
    return urlJoin('/blog', categorySlug, articleSlug);
  },
  toMediaUrl: (url: string) => {
    return urlJoin(process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL as string, url);
  },

  // To generate srcSet for <img> tag
  buildSrcSet: (formats: Record<string, BlogMediaFormat>) => {
    return Object.values(formats)
      .sort((a, b) => a.width - b.width)
      .map((f) => `${strapiUtils.toMediaUrl(f.url)} ${f.width}w`)
      .join(', ');
  },

  // Used for fetch Strapi data
  fetch: {
    // /blog/layout.tsx
    generateCategoriesQueryStringForLeftPanel: (
      filters?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        populate: {
          articles: {
            fields: ['title', 'slug'],
          },
        },
        filters,
      };
      return qs.stringify(queryObject);
    },

    // /blog/page.tsx
    // /blog/[category]/page.tsx
    // /blog/tag/[tag]/page.tsx
    // /blog/page/[page]/page.tsx
    generateArticlesQueryString: (
      filters?: object | undefined,
      pagination?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        populate: ['banner', 'tags', 'author', 'category'],
        fields: [
          'title',
          'description',
          'createdAt',
          'updatedAt',
          'publishedAt',
          'slug',
          'readTime',
        ],
        pagination: _defaults(pagination, defaultPagination),
        filters,
      };
      return qs.stringify(queryObject);
    },

    // /blog/[category]/[article]/page.tsx
    generateArticleQueryString: (filters?: object | undefined) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        populate: ['banner', 'tags', 'category', 'author', 'author.avatar'],
        filters,
      };
      return qs.stringify(queryObject);
    },
  },

  // Used for generateStaticParams
  staticParams: {
    // /blog/[category]/page.tsx
    generateCategoriesQueryStringForCategorPage: (
      filters?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        fields: ['slug'],
        filters,
      };
      return qs.stringify(queryObject);
    },

    // /blog/[category]/[artcle]/page.tsx
    generateCategoriesQueryStringForCategorArticlePage: (
      filters?: object | undefined,
      pagination?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        fields: ['slug'],
        populate: {
          articles: {
            fields: ['slug'],
          },
        },
        pagination: _defaults(pagination, defaultPagination),
        filters,
      };
      return qs.stringify(queryObject);
    },

    // /blog/tag/[tag]/page.tsx
    generateTagsQueryStringForTagPage: (filters?: object | undefined) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        fields: ['slug'],
        filters,
      };
      return qs.stringify(queryObject);
    },

    // /blog/page/[page]/page.tsx
    generateArticlesQueryStringForPagePage: (
      filters?: object | undefined,
      pagination?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        fields: ['slug'],
        pagination: _defaults(pagination, defaultPagination),
        filters,
      };
      return qs.stringify(queryObject);
    },
  },

  // Used for static route handler
  staticRoute: {
    // /data/blog/search.json/route.ts
    generateArticlesQueryStringForSearch: (filters?: object | undefined) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        populate: ['tags', 'category'],
        fields: ['title', 'description', 'content', 'slug'],
        filters,
      };
      return qs.stringify(queryObject);
    },
  },
};

export default strapiUtils;
