import type { Metadata } from 'next';
import urlJoin from 'url-join';
import strapiUtils from '@/utils/strapi-utils';
import seoUtils from '@/utils/seo-utils';
import Articles from '@/components/blog/articles';
import _get from 'lodash/get';
import _size from 'lodash/size';
import _map from 'lodash/map';
import _find from 'lodash/find';

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
  const tags = _get(articles, ['data', 0, 'tags']);
  const tagData = _find(tags, (t) => t.slug === tagSlug);
  const { name, slug } = tagData;

  const url = urlJoin(domain, 'blog/tag', slug);

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
    strapiUtils.staticParams.generateTagsQueryStringForTagPage({
      articles: {
        '$notNull': true,
      },
    });
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/tags?${queryString}`
  );
  const tags = await response.json();

  return _map(tags.data, ({ slug }) => ({
    tag: slug,
  }));
}

const fetchArticles = async (tagSlug: string) => {
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
  const data = await response.json();
  return data;
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
