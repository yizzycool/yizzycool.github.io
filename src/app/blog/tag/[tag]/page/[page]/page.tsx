import type { Metadata } from 'next';
import type { BlogTagData } from '@/types/blog/tag';
import urlJoin from 'url-join';
import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';
import Articles from '@/components/blog/articles';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _flatMap from 'lodash/flatMap';
import _range from 'lodash/range';
import _find from 'lodash/find';

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
  const tags = _get(articles, ['data', 0, 'tags']);
  const tag = _find(tags, (t) => t.slug === tagSlug) || {};
  const { name, slug } = tag as BlogTagData;

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
    const queryString =
      strapiUtils.staticParams.generateTagsQueryStringForTagPage({
        articles: {
          '$notNull': true,
        },
      });
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/tags?${queryString}`
    );
    const articles = await response.json();
    const { data } = articles;

    return _map(data, ({ slug }) => slug);
  };

  const generatePageSlugs = async (tagSlug: string) => {
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
    const articles = await response.json();
    return _get(articles, ['meta', 'pagination', 'pageCount']);
  };

  const tagSlugs = await generateTagSlugs();
  const pageCounts = await Promise.all(
    _map(tagSlugs, (slug) => generatePageSlugs(slug))
  );

  return _flatMap(tagSlugs, (slug, index) => {
    return _map(_range(1, pageCounts[index] + 1), (page) => ({
      tag: slug,
      page: page.toString(),
    }));
  });
}

const fetchArticles = async (tagSlug: string, page: number) => {
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
  const data = await response.json();
  return data;
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
