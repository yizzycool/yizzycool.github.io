import type { Metadata } from 'next';
import urlJoin from 'url-join';
import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';
import Articles from '@/components/blog/articles';
import _map from 'lodash/map';
import _range from 'lodash/range';
import _get from 'lodash/get';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '/';

type Props = {
  params: Promise<{
    page: number;
  }>;
};

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;

  const url = urlJoin(domain, 'blog', page === 1 ? '' : `page/${page}`);

  return {
    title: `Blog - Page ${page} | Yizzy Peasy`,
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
  const queryString =
    strapiUtils.staticParams.generateArticlesQueryStringForPagePage();
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const articles = await response.json();
  const pageCount = _get(articles, ['meta', 'pagination', 'pageCount']);

  return _map(_range(1, pageCount + 1), (page) => ({
    page: page.toString(),
  }));
}

const fetchAllArticles = async (page: number) => {
  const queryString = strapiUtils.fetch.generateArticlesQueryString(undefined, {
    page,
  });
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const data = await response.json();
  return data;
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
      <Articles articles={articles} />
    </>
  );
}
