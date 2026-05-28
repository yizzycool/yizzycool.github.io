import type { Metadata } from 'next';
import urlJoin from 'url-join';
import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';
import Articles from '@/components/blog/articles';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '/';
const url = urlJoin(domain, 'blog');

// Generate metadata
export const metadata: Metadata = {
  title: 'Blog | Yizzy Peasy',
  description:
    'Yizzy Peasy 的技術部落格，涵蓋前端開發、JavaScript、Web API、Chrome Built-in AI 等深度教學與實用筆記。',
  alternates: {
    canonical: url,
  },

  openGraph: {
    title: 'Blog | Yizzy Peasy — 前端 Web 開發筆記',
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
    title: 'Blog | Yizzy Peasy — 前端 Web 開發筆記',
    description:
      '深入的前端與 Web 技術教學、Chrome API 實作筆記與工程實例整理。',
    images: [urlJoin(domain, 'assets/images/blog/twitter-image.jpg')],
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
      <Articles articles={articles} />
    </>
  );
}
