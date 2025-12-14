import type { BlogArticle, BlogCategory } from '@/types/blog';
import type { Metadata } from 'next';
import urlJoin from 'url-join';
import seoUtils from '@/utils/seo-utils';
import strapiUtils from '@/utils/strapi-utils';
import Article from '@/components/blog/article';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import { toc as rehypeToc } from '@jsdevtools/rehype-toc';
import rehypeStringify from 'rehype-stringify';
import _get from 'lodash/get';
import _size from 'lodash/size';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '/';

type Slug = { category: string; article: string };

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<Slug>;
}): Promise<Metadata> {
  const { article: articleSlug } = await params;
  const article = await fetchArticle(articleSlug);
  const data = _get(article, 'data.0') || {};

  return {
    title: `${data.title} | Yizzy Peasy`,
    description: data.metaDescription,

    openGraph: {
      title: data.title,
      description: data.ogDescription,
      type: 'article',
      url: urlJoin(domain, 'blog', data.slug),
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
    strapiUtils.staticParams.generateCategoriesQueryStringForCategorArticlePage();
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/categories?${queryString}`
  );
  const categoryArticleData: BlogCategory = await response.json();
  const { data } = categoryArticleData;

  const allSlugs: Array<Slug> = [];

  data.forEach((category) => {
    const categorySlug = category.slug;
    category.articles.map((article) => {
      allSlugs.push({
        category: categorySlug,
        article: article.slug,
      });
    });
  });

  return allSlugs;
}

const fetchArticle = async (articleSlug: string) => {
  const queryString = strapiUtils.fetch.generateArticleQueryStringF({
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

export default async function Page({ params }: { params: Promise<Slug> }) {
  const { article: articleSlug } = await params;
  const article = await fetchArticle(articleSlug);
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
      <Article article={article} toc={toc} />
    </>
  );
}
