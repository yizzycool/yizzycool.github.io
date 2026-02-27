import type { BlogArticle } from '@/types/blog';
import type { Metadata } from 'next';

import urlJoin from 'url-join';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import { toc as rehypeToc } from '@jsdevtools/rehype-toc';
import rehypeStringify from 'rehype-stringify';

import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';
import Article from '@/components/blog/article';

import _get from 'lodash/get';
import _size from 'lodash/size';
import _flatMap from 'lodash/flatMap';
import _map from 'lodash/map';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '/';

type Props = {
  params: Promise<{
    category: string;
    article: string;
  }>;
};

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { article: articleSlug } = await params;
  const article = await fetchArticle(articleSlug);
  const data = _get(article, ['data', 0]) || {};
  const categorySlug = _get(data, ['category', 'slug']);

  const url = urlJoin(
    domain,
    strapiUtils.toBlogCategoryArticleUrl(categorySlug, articleSlug)
  );

  return {
    title: `${data.title} | Yizzy Peasy`,
    description: data.metaDescription,
    alternates: {
      canonical: url,
    },

    openGraph: {
      title: data.title,
      description: data.ogDescription,
      type: 'article',
      url,
      publishedTime: data.publishedAt ?? data.createdAt,
      modifiedTime: data.updatedAt ?? data.publishedAt ?? data.createdAt,

      images: [
        {
          url: strapiUtils.toMediaUrl(data.banner.url),
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.twitterDescription ?? data.ogDescription,
      images: [strapiUtils.toMediaUrl(data.banner.url)],
    },
  };
}

export async function generateStaticParams() {
  const queryString =
    strapiUtils.staticParams.generateCategoriesQueryStringForCategorArticlePage(
      undefined,
      { pageCount: 9999 }
    );
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/categories?${queryString}`
  );
  const categories = await response.json();
  const { data } = categories;

  return _flatMap(data, ({ slug: categorySlug, articles }) =>
    _map(articles, ({ slug }) => ({
      category: categorySlug,
      article: slug,
    }))
  );
}

const fetchArticle = async (articleSlug: string) => {
  const queryString = strapiUtils.fetch.generateArticleQueryString({
    slug: {
      '$eq': articleSlug,
    },
  });
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const data = await response.json();
  return data;
};

const getPrevNextArticle = async (
  type: 'prev' | 'next',
  article: BlogArticle
) => {
  const categoryOrder = _get(article, ['data', 0, 'category', 'order']);
  const shortTitle = _get(article, ['data', 0, 'shortTitle']);

  const compareKey = type === 'prev' ? '$lt' : '$gt';
  const sortArray =
    type === 'prev'
      ? ['category.order:desc'] //, 'shortTitle:desc']
      : ['category.order']; //, 'shortTitle'];

  const queryString = strapiUtils.fetch.generatePrevNextArticleInfoQueryString(
    {
      $or: [
        // Get previous/next categorys articles
        {
          category: {
            order: { [compareKey]: categoryOrder },
          },
        },
        // or get previous/next articles under same category
        {
          category: {
            order: { $eq: categoryOrder },
          },
          shortTitle: { [compareKey]: shortTitle },
        },
      ],
    },
    sortArray
  );

  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const data = await response.json();
  return data;
};

const parseToc = async (article: BlogArticle) => {
  const data = _get(article, 'data.0') || {};
  const { content } = data;

  const toc = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeToc)
    .use(rehypeStringify)
    .process(content);

  const regex = /<nav class="toc">.*?<\/nav>/;
  const result = String(toc).match(regex);

  if (_size(result) < 1) return '';
  return result?.[0] || '';
};

export default async function Page({ params }: Props) {
  const { article: articleSlug } = await params;
  const article = await fetchArticle(articleSlug);
  const prevArticle = await getPrevNextArticle('prev', article);
  const nextArticle = await getPrevNextArticle('next', article);
  const toc = await parseToc(article);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateBlogArticleJsonLd(article)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            seoUtils.generateBlogArticleBreadcrumbJsonLd(article)
          ),
        }}
      />
      <Article
        article={article}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
        toc={toc}
      />
    </>
  );
}
