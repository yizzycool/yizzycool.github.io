import { BlogCategory } from '@/types/blog';
import strapiUtils from '@/utils/strapi-utils';
import Article from '@/components/blog/article';

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
  const queryString = strapiUtils.getArticleQueryString(articleSlug);
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const data = await response.json();
  return data;
};

export default async function Page({ params }: { params: Promise<Slug> }) {
  const { article: articleSlug } = await params;
  const article = await fetchArticle(articleSlug);

  return <Article article={article} />;
}
