import type { Metadata } from 'next';
import type { BlogTagData } from '@/types/blog/tag';

import urlJoin from 'url-join';
import { get, map, flatMap, range, find } from 'lodash';

import Articles from '@/components/blog/articles';
import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';

const domain = process.env.NEXT_PUBLIC_DOMAIN as string;

type Props = {
  params: Promise<{
    tag: string;
    page: number;
  }>;
};

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: tagSlug, page } = await params;
  const articles = await fetchArticles(tagSlug, page);
  const tags = get(articles, ['data', 0, 'tags']) || [];
  const tag = find(tags, (t) => t.slug === tagSlug) || {};
  const name = (tag as BlogTagData).name || '';
  const slug = (tag as BlogTagData).slug || tagSlug || '';

  const url = urlJoin(
    domain,
    'blog/tag',
    slug,
    page === 1 ? '' : `page/${page}`
  );

  return {
    title: `Blog - ${name} Articles - Page ${page} | Yizzy Peasy`,
    description:
      'Yizzy Peasy 的技術部落格，涵蓋前端開發、JavaScript、Web API、Chrome Built-in AI 等深度教學與實用筆記。',
    alternates: {
      canonical: url,
    },

    openGraph: {
      title: 'Yizzy Peasy | Blog — 前端 Web 開發筆記',
      description:
        '深入的前端與 Web 技術教學、Chrome API 實作筆記與工程實例整理。',
      url,
      siteName: 'Yizzy Peasy',
      images: [
        {
          url: urlJoin(domain, 'assets/images/blog/og-image.jpg'),
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: 'Yizzy Peasy | Blog — 前端 Web 開發筆記',
      description:
        '深入的前端與 Web 技術教學、Chrome API 實作筆記與工程實例整理。',
      images: [urlJoin(domain, 'assets/images/blog/twitter-image.jpg')],
    },
  };
}

export async function generateStaticParams() {
  const generateTagSlugs = async () => {
    try {
      const queryString =
        strapiUtils.staticParams.generateTagsQueryStringForTagPage({
          articles: {
            '$notNull': true,
          },
        });
      const response = await fetch(
        `${process.env.STRAPI_URL}/api/tags?${queryString}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const articles = await response.json();
      const { data } = articles;

      return map(data || [], ({ slug }) => slug);
    } catch (error) {
      console.warn('Error generating tag slugs:', error);
      return [];
    }
  };

  const generatePageSlugs = async (tagSlug: string) => {
    try {
      const queryString =
        strapiUtils.staticParams.generateArticlesQueryStringForPagePage({
          tags: {
            slug: {
              '$in': tagSlug,
            },
          },
        });
      const response = await fetch(
        `${process.env.STRAPI_URL}/api/articles?${queryString}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const articles = await response.json();
      return get(articles, ['meta', 'pagination', 'pageCount']) || 0;
    } catch (error) {
      console.warn(`Error generating page slugs for tag ${tagSlug}:`, error);
      return 0;
    }
  };

  const tagSlugs = await generateTagSlugs();
  const pageCounts = await Promise.all(
    map(tagSlugs, (slug) => generatePageSlugs(slug))
  );

  return flatMap(tagSlugs, (slug, index) => {
    return map(range(1, (pageCounts[index] || 0) + 1), (page) => ({
      tag: slug,
      page: page.toString(),
    }));
  });
}

const fetchArticles = async (tagSlug: string, page: number) => {
  try {
    const queryString = strapiUtils.fetch.generateArticlesQueryString(
      {
        tags: {
          slug: {
            '$in': tagSlug,
          },
        },
      },
      {
        page,
      }
    );
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/articles?${queryString}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(
      `Error fetching articles for tag ${tagSlug} page ${page}:`,
      error
    );
    return {
      data: [],
      meta: { pagination: { page, pageSize: 10, pageCount: 0, total: 0 } },
    };
  }
};

export default async function Page({ params }: Props) {
  const { tag: tagSlug, page } = await params;
  const articles = await fetchArticles(tagSlug, page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            seoUtils.generateBlogTagJsonLd(articles, tagSlug, page)
          ),
        }}
      />
      <Articles articles={articles} />
    </>
  );
}
