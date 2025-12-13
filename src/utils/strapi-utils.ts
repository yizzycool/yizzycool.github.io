import urlJoin from 'url-join';
import qs from 'qs';

type QueryObject = {
  status: 'published' | 'draft';
  populate?: object;
  fields?: object;
  filters?: object;
};

const strapiUtils = {
  toBlogUrl: (categorySlug: string, articleSlug: string) => {
    return urlJoin('/blog', categorySlug, articleSlug);
  },
  toMediaUrl: (url: string) => {
    return urlJoin(process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL as string, url);
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

    // /blog/[category]/page.tsx
    generateArticlesQueryString: (filters?: object | undefined) => {
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
        filters,
      };
      return qs.stringify(queryObject);
    },

    // /blog/[category]/[article]/page.tsx
    generateArticleQueryStringF: (filters?: object | undefined) => {
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
      filters?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        fields: ['slug'],
        populate: {
          articles: {
            fields: ['slug'],
          },
        },
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
