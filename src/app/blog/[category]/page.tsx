import { BlogCategory } from '@/types/blog';
import strapiUtils from '@/utils/strapi-utils';
import Articles from '@/components/blog/articles';
import _get from 'lodash/get';
import _size from 'lodash/size';
import _map from 'lodash/map';

type Slug = { category: string };

export async function generateStaticParams() {
  const queryString = strapiUtils.getCategoryArticlesQueryString();
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/categories?${queryString}`
  );
  const categoryArticleData: BlogCategory = await response.json();
  const { data } = categoryArticleData;

  return _map(data, ({ slug, name }) => ({
    category: slug,
    name,
  }));
}

const fetchArticle = async (categorySlug: string) => {
  const queryString = strapiUtils.getAllArticlesQueryString({
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

export default async function Page({ params }: { params: Promise<Slug> }) {
  const { category: categorySlug } = await params;
  const articles = await fetchArticle(categorySlug);

  return <Articles articles={articles} categorySlug={categorySlug} />;
}
