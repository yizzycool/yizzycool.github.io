import strapiUtils from '@/utils/strapi-utils';
import AllArticles from '@/components/blog/all-articles';

const fetchAllArticles = async () => {
  const queryString = strapiUtils.getAllArticlesQueryString();
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const data = await response.json();
  return data;
};

export default async function Page() {
  const articles = await fetchAllArticles();

  return <AllArticles articles={articles} />;
}
