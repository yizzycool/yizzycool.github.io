import type { MetadataRoute } from 'next';
import urlJoin from 'url-join';

export const dynamic = 'force-static';

const domain = process.env.NEXT_PUBLIC_DOMAIN as string;
const sitemapUrl = urlJoin(domain, 'sitemap.xml');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: sitemapUrl,
  };
}
