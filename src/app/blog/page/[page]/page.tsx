import type { Metadata } from 'next';

import urlJoin from 'url-join';
import { map, range, get } from 'lodash';

import Articles from '@/components/blog/articles';
import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '/';

type Props = {
  params: Promise<{
    page: number;
  }>;
};

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;

  const meta = {
    url: urlJoin(domain, 'blog', page === 1 ? '' : `page/${page}`),
    title: `Blog - Page ${page} | Yizzy Peasy`,
    description: `Yizzy Peasy 的技術部落格，專注於 JavaScript、TypeScript、React 等前端開發，並涵蓋 Web API、AI 應用、網路協定與 LeetCode 解題筆記。（第 ${page} 頁）`,
    og: {
      siteName: 'Yizzy Peasy',
      title: `Blog | Yizzy Peasy - 前端開發、AI 與網頁技術筆記（第 ${page} 頁）`,
      description:
        '前端與 Web 技術教學，涵蓋 React、TypeScript、AI 應用、網路協定與 LeetCode 解題整理。',
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
      description: meta.og.description,
      url: meta.url,
      siteName: meta.og.siteName,
      images: [meta.og.image],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.og.title,
      description: meta.og.description,
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
      strapiUtils.staticParams.generateArticlesQueryStringForPagePage();
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/articles?${queryString}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const articles = await response.json();
    const pageCount = get(articles, ['meta', 'pagination', 'pageCount']) || 0;

    return map(range(1, pageCount + 1), (page) => ({
      page: page.toString(),
    }));
  } catch (error) {
    console.warn('Error generating static params for page:', error);
    return [];
  }
}

const fetchAllArticles = async (page: number) => {
  try {
    const queryString = strapiUtils.fetch.generateArticlesQueryString(
      undefined,
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
    console.warn(`Error fetching all articles for page ${page}:`, error);
    return {
      data: [],
      meta: { pagination: { page, pageSize: 10, pageCount: 0, total: 0 } },
    };
  }
};

export default async function Page({ params }: Props) {
  const { page } = await params;
  const articles = await fetchAllArticles(page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateBlogJsonLd(page)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateBlogBreadcrumbJsonLd(page)),
        }}
      />
      <Articles articles={articles} />
    </>
  );
}
