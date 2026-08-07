import type { Metadata } from 'next';

import urlJoin from 'url-join';
import { get, map, flatMap, range } from 'lodash';

import Articles from '@/components/blog/articles';
import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';

const domain = process.env.NEXT_PUBLIC_DOMAIN as string;

type Props = {
  params: Promise<{
    category: string;
    page: number;
  }>;
};

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, page } = await params;
  const articles = await fetchArticles(categorySlug, page);
  const category = get(articles, ['data', 0, 'category']) || {};
  const name = category.name || '';
  const slug = category.slug || categorySlug || '';

  const meta = {
    url: urlJoin(
      domain,
      'blog/category',
      slug,
      page === 1 ? '' : `page/${page}`
    ),
    title: `${name} 技術文章與筆記 - 第 ${page} 頁 | Yizzy Peasy`,
    description: `Yizzy Peasy 部落格 - 關於 ${name} 的技術文章、深度教學與筆記，幫助開發者掌握 ${name} 核心概念與應用。（第 ${page} 頁）`,
    og: {
      siteName: 'Yizzy Peasy',
      title: `${name} 技術文章與教學筆記 — Yizzy Peasy Blog（第 ${page} 頁）`,
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
  const generateCategorySlugs = async () => {
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
      return map(categories.data || [], ({ slug }) => slug);
    } catch (error) {
      console.warn('Error generating category slugs:', error);
      return [];
    }
  };

  const generatePageSlugs = async (categorySlug: string) => {
    try {
      const queryString =
        strapiUtils.staticParams.generateArticlesQueryStringForPagePage({
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
      const articles = await response.json();
      return get(articles, ['meta', 'pagination', 'pageCount']) || 0;
    } catch (error) {
      console.warn(
        `Error generating page slugs for category ${categorySlug}:`,
        error
      );
      return 0;
    }
  };

  const categorySlugs = await generateCategorySlugs();
  const pageCounts = await Promise.all(
    map(categorySlugs, (slug) => generatePageSlugs(slug))
  );

  return flatMap(categorySlugs, (slug, index) => {
    return map(range(1, (pageCounts[index] || 0) + 1), (page) => ({
      category: slug,
      page: page.toString(),
    }));
  });
}

const fetchArticles = async (categorySlug: string, page: number) => {
  try {
    const queryString = strapiUtils.fetch.generateArticlesQueryString(
      {
        category: {
          slug: {
            '$eq': categorySlug,
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
      `Error fetching articles for category ${categorySlug} page ${page}:`,
      error
    );
    return {
      data: [],
      meta: { pagination: { page, pageSize: 10, pageCount: 0, total: 0 } },
    };
  }
};

export default async function Page({ params }: Props) {
  const { category: categorySlug, page } = await params;
  const articles = await fetchArticles(categorySlug, page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            seoUtils.generateBlogCategoryJsonLd(articles, page)
          ),
        }}
      />
      <Articles articles={articles} categorySlug={categorySlug} />
    </>
  );
}
