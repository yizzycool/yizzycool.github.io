import type { Metadata } from 'next';

import urlJoin from 'url-join';
import { get, map, find } from 'lodash';

import Articles from '@/components/blog/articles';
import strapiUtils from '@/utils/strapi-utils';
import seoUtils from '@/utils/seo-utils';

const domain = process.env.NEXT_PUBLIC_DOMAIN as string;

type Props = {
  params: Promise<{
    tag: string;
  }>;
};

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const articles = await fetchArticles(tagSlug);
  const tags = get(articles, ['data', 0, 'tags']) || [];
  const tagData = find(tags, (t) => t.slug === tagSlug) || {};
  const name = tagData.name || '';
  const slug = tagData.slug || tagSlug || '';

  const meta = {
    url: urlJoin(domain, 'blog/tag', slug),
    title: `${name} 相關技術文章與筆記 | Yizzy Peasy`,
    description: `瀏覽與 ${name} 標籤相關的所有技術文章、實操教學與開發隨筆，協助開發者快速尋求 ${name} 的解決方案。`,
    og: {
      siteName: 'Yizzy Peasy',
      title: `${name} 標籤文章總覽 — Yizzy Peasy Blog`,
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
    const tags = await response.json();

    return map(tags.data || [], ({ slug }) => ({
      tag: slug,
    }));
  } catch (error) {
    console.warn('Error generating static params for tag:', error);
    return [];
  }
}

const fetchArticles = async (tagSlug: string) => {
  try {
    const queryString = strapiUtils.fetch.generateArticlesQueryString({
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
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`Error fetching articles for tag ${tagSlug}:`, error);
    return {
      data: [],
      meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
    };
  }
};

export default async function Page({ params }: Props) {
  const { tag: tagSlug } = await params;
  const articles = await fetchArticles(tagSlug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            seoUtils.generateBlogTagJsonLd(articles, tagSlug)
          ),
        }}
      />
      <Articles articles={articles} tagSlug={tagSlug} />
    </>
  );
}
