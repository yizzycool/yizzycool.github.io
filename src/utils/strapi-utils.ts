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
  getCategoryArticlesQueryString: (filters?: object | undefined) => {
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
  getAllArticlesQueryString: (filters?: object | undefined) => {
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
  getAllArticlesQueryStringForSearch: (filters?: object | undefined) => {
    const queryObject: QueryObject = {
      status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
      populate: ['tags', 'category'],
      fields: ['title', 'description', 'content', 'slug'],
      filters,
    };
    return qs.stringify(queryObject);
  },
  getArticleQueryString: (filters?: object | undefined) => {
    const queryObject: QueryObject = {
      status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
      populate: ['banner', 'tags', 'category', 'author', 'author.avatar'],
      filters,
    };
    return qs.stringify(queryObject);
  },
};

export default strapiUtils;
