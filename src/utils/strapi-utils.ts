import urlJoin from 'url-join';
import qs from 'qs';

const strapiUtils = {
  toBlogUrl: (categorySlug: string, articleSlug: string) => {
    return urlJoin('/blog', categorySlug, articleSlug);
  },
  toMediaUrl: (url: string) => {
    return urlJoin(process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL as string, url);
  },
  getCategoryArticlesQueryString: () => {
    const queryObject = {
      status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
      populate: {
        articles: {
          fields: ['title', 'slug'],
        },
      },
    };
    return qs.stringify(queryObject);
  },
  getAllArticlesQueryString: () => {
    const queryObject = {
      status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
      populate: ['banner', 'tags', 'author', 'category'],
      fields: [
        'title',
        'description',
        'createdAt',
        'updatedAt',
        'publishedAt',
        'slug',
      ],
    };
    return qs.stringify(queryObject);
  },
  getArticleQueryString: (articleSlug: string) => {
    const queryObject = {
      status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
      populate: ['banner', 'tags', 'author', 'category'],
      filters: {
        slug: {
          '$eq': articleSlug,
        },
      },
    };
    return qs.stringify(queryObject);
  },
};

export default strapiUtils;
