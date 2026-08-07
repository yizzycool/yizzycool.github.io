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

  const meta = {
    url: urlJoin(domain, 'blog/tag', slug, page === 1 ? '' : `page/${page}`),
    title: `${name} 相關技術文章與筆記 - 第 ${page} 頁 | Yizzy Peasy`,
    description: `瀏覽與 ${name} 標籤相關的所有技術文章、實操教學與開發隨筆，協助開發者快速尋求 ${name} 的解決方案。（第 ${page} 頁）`,
    og: {
      siteName: 'Yizzy Peasy',
      title: `${name} 標籤文章總覽 — Yizzy Peasy Blog（第 ${page} 頁）`,
      image: {
        url: urlJoin(domain, 'assets/images/blog/og-image.jpg'),
        width: 1200,
        height: 630,
        alt: 'Banner image',
      },
    },
  };

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.url,
    },

    openGraph: {
      title: meta.og.title,
      description: meta.description,
      url: meta.url,
      siteName: meta.og.siteName,
      images: [meta.og.image],
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: meta.og.title,
      description: meta.description,
      images: [meta.og.image.url],
    },
    robots: {
      index: false,
      follow: true,
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
      <Articles articles={articles} tagSlug={tagSlug} />
    </>
  );
}
