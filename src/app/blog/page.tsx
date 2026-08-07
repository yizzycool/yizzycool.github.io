import type { Metadata } from 'next';
import urlJoin from 'url-join';
import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';
import Articles from '@/components/blog/articles';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '/';

const meta = {
  url: urlJoin(domain, 'blog'),
  title: 'Blog | Yizzy Peasy',
  description:
    'Yizzy Peasy 的技術部落格，專注於 JavaScript、TypeScript、React 等前端開發，並涵蓋 Web API、AI 應用、網路協定與 LeetCode 解題筆記。',
  og: {
    siteName: 'Yizzy Peasy',
    title: 'Blog | Yizzy Peasy - 前端開發、AI 與網頁技術筆記',
    description:
      '前端與 Web 技術教學，涵蓋 React、TypeScript、AI 應用、網路協定與 LeetCode 解題整理。',
    image: {
      url: urlJoin(domain, '/assets/images/blog/og-image.jpg'),
      width: 1200,
      height: 630,
      alt: 'Banner image',
    },
  },
};

// Generate metadata
export const metadata: Metadata = {
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
};

const fetchAllArticles = async () => {
  try {
    const queryString = strapiUtils.fetch.generateArticlesQueryString();
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/articles?${queryString}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching all articles:', error);
    return {
      data: [],
      meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
    };
  }
};

export default async function Page() {
  const articles = await fetchAllArticles();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateBlogJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateBlogBreadcrumbJsonLd()),
        }}
      />
      <Articles articles={articles} />
    </>
  );
}
