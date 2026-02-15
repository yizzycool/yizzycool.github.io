import type { MetadataRoute } from 'next';
import urlJoin from 'url-join';

export const dynamic = 'force-static';

const domain = process.env.NEXT_PUBLIC_DOMAIN as string;
const sitemapUrl = urlJoin(domain, 'sitemap.xml');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          'Amazonbot',
          'Applebot-Extended',
          'Brightbot',
          'ClaudeBot',
          'Google-Extended',
          'GPTBot',
          'PerplexityBot',
          'PetalBot',
          'Scrapy',
          'uptimerobot',
          'viberbot',
          'YaK',
          'Yandex',
          'Yeti',
        ],
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: sitemapUrl,
  };
}
