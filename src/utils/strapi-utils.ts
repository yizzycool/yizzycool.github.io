import urlJoin from 'url-join';

const strapiUtils = {
  toBlogUrl: (categorySlug: string, articleSlug: string) => {
    return urlJoin('/blog', categorySlug, articleSlug);
  },
  toMediaUrl: (url: string) => {
    return urlJoin(process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL as string, url);
  },
};

export default strapiUtils;
