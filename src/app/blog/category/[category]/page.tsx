import type { Metadata } from 'next';

import urlJoin from 'url-join';
import { get, map } from 'lodash';

import Articles from '@/components/blog/articles';
import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';

const domain = process.env.NEXT_PUBLIC_DOMAIN as string;

type Props = {
  params: Promise<{ category: string }>;
};

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const articles = await fetchArticles(categorySlug);
  const category = get(articles, ['data', 0, 'category']) || {};
  const name = category.name || '';
  const slug = category.slug || categorySlug || '';

  const meta = {
    url: urlJoin(domain, 'blog/category', slug),
    title: `${name} 技術文章與筆記 | Yizzy Peasy`,
    description: `Yizzy Peasy 部落格 - 關於 ${name} 的技術文章、深度教學與筆記，幫助開發者掌握 ${name} 核心概念與應用。`,
    og: {
      siteName: 'Yizzy Peasy',
      title: `${name} 技術文章與教學筆記 — Yizzy Peasy Blog`,
      image: {
        url: urlJoin(domain, '/assets/images/blog/og-image.jpg'),
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
  };
}

export async function generateStaticParams() {
  try {
    const queryString =
      strapiUtils.staticParams.generateCategoriesQueryStringForCategorPage();
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/categories?${queryString}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const categories = await response.json();

    return map(categories.data || [], ({ slug }) => ({
      category: slug,
    }));
  } catch (error) {
    console.warn('Error generating static params for category:', error);
    return [];
  }
}

const fetchArticles = async (categorySlug: string) => {
  try {
    const queryString = strapiUtils.fetch.generateArticlesQueryString({
      category: {
        slug: {
          '$eq': categorySlug,
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
    console.warn(
      `Error fetching articles for category ${categorySlug}:`,
      error
    );
    return {
      data: [],
      meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
    };
  }
};

export default async function Page({ params }: Props) {
  const { category: categorySlug } = await params;
  const articles = await fetchArticles(categorySlug);
  const categoryName =
    get(articles, ['data', 0, 'category', 'name']) || categorySlug;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateBlogCategoryJsonLd(articles)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            seoUtils.generateCategoryBreadcrumbJsonLd(
              categoryName,
              categorySlug
            )
          ),
        }}
      />
      <Articles articles={articles} categorySlug={categorySlug} />
    </>
  );
}
