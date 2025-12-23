import type { MetadataRoute } from 'next';
import urlJoin from 'url-join';
import { generateStaticParams as generateCategoryArticles } from './blog/[category]/[article]/page';
import { generateStaticParams as generateCategories } from './blog/category/[category]/page';
import { generateStaticParams as generateCategoryPages } from './blog/category/[category]/page/[page]/page';
import { generateStaticParams as generatePages } from './blog/page/[page]/page';
import { generateStaticParams as generateTags } from './blog/tag/[tag]/page';
import { generateStaticParams as generateTagPages } from './blog/tag/[tag]/page/[page]/page';
import { Tools } from '@/data/tools';
import _map from 'lodash/map';
import _flatMap from 'lodash/flatMap';

export const dynamic = 'force-static';

const domain = process.env.NEXT_PUBLIC_DOMAIN as string;

const lastModified = new Date().toISOString();

const generateBlogData = async (): Promise<MetadataRoute.Sitemap> => {
  const changeFrequency = 'weekly' as const;
  const priority = 1.0;

  // /blog/[category]/[article]
  const categoryArticles = await generateCategoryArticles();
  const categoryArticleUrls = _map(
    categoryArticles,
    ({ category, article }) => {
      return {
        url: urlJoin(domain, '/blog', category, article),
        lastModified,
        changeFrequency,
        priority,
      };
    }
  );

  // /blog/category/[category]
  const categories = await generateCategories();
  const categoryUrls = _map(categories, ({ category }) => {
    return {
      url: urlJoin(domain, '/blog/category', category),
      lastModified,
      changeFrequency,
      priority,
    };
  });

  // /blog/category/[category]/page/[page]
  const categoriePages = await generateCategoryPages();
  const categoryPageUrls = _map(categoriePages, ({ category, page }) => {
    return {
      url: urlJoin(domain, '/blog/category', category, '/page', page),
      lastModified,
      changeFrequency,
      priority,
    };
  });

  // /blog/page/[page]
  const pages = await generatePages();
  const pageUrls = _map(pages, ({ page }) => {
    return {
      url: urlJoin(domain, '/blog/page', page),
      lastModified,
      changeFrequency,
      priority,
    };
  });

  // /blog/tag/[tag]
  const tags = await generateTags();
  const tagUrls = _map(tags, ({ tag }) => {
    return {
      url: urlJoin(domain, '/blog/tag', tag),
      lastModified,
      changeFrequency,
      priority,
    };
  });

  // /blog/tag/[tag]/page/[page]
  const tagPages = await generateTagPages();
  const tagPageUrls = _map(tagPages, ({ tag, page }) => {
    return {
      url: urlJoin(domain, '/blog/tag', tag, '/page', page),
      lastModified,
      changeFrequency,
      priority,
    };
  });

  return [
    ...categoryArticleUrls,
    ...categoryUrls,
    ...categoryPageUrls,
    ...pageUrls,
    ...tagUrls,
    ...tagPageUrls,
  ];
};

const ToolsSitemap: MetadataRoute.Sitemap = _flatMap(Tools, (tool) =>
  _map(tool.items, (item) => ({
    url: urlJoin(domain, item.href),
    lastModified,
    changeFrequency: 'weekly',
    priority: 1.0,
  }))
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static Pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: urlJoin(domain, '/'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: urlJoin(domain, '/blog'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: urlJoin(domain, '/resume'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    ...ToolsSitemap,
  ];

  // Blog Pages
  const blogUrls = await generateBlogData();

  return [...staticUrls, ...blogUrls];
}
