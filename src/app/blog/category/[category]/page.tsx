import type { Metadata } from 'next';
import urlJoin from 'url-join';
import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';
import Articles from '@/components/blog/articles';
import _get from 'lodash/get';
import _size from 'lodash/size';
import _map from 'lodash/map';

const domain = process.env.NEXT_PUBLIC_DOMAIN as string;

type Props = {
  params: Promise<{ category: string }>;
};

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const articles = await fetchArticles(categorySlug);
  const category = _get(articles, ['data', 0, 'category']);
  const { name, slug } = category;

  const url = urlJoin(domain, 'blog/category', slug);

  return {
    title: `Blog - ${name} Articles | Yizzy Peasy`,
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
    strapiUtils.staticParams.generateCategoriesQueryStringForCategorPage();
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/categories?${queryString}`
  );
  const categories = await response.json();

  return _map(categories.data, ({ slug }) => ({
    category: slug,
  }));
}

const fetchArticles = async (categorySlug: string) => {
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
  const data = await response.json();
  return data;
};

export default async function Page({ params }: Props) {
  const { category: categorySlug } = await params;
  const articles = await fetchArticles(categorySlug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateBlogCategoryJsonLd(articles)),
        }}
      />
      <Articles articles={articles} categorySlug={categorySlug} />
    </>
  );
}
