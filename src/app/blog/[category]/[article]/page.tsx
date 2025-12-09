import { BlogArticle, BlogCategory } from '@/types/blog';
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

type Slug = { category: string; article: string };

export async function generateStaticParams() {
  const queryString = strapiUtils.getCategoryArticlesQueryString();
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
  const queryString = strapiUtils.getArticleQueryString({
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

  return <Article article={article} toc={toc} />;
}
