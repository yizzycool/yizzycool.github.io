import strapiUtils from '@/utils/strapi-utils';
import Articles from '@/components/blog/articles';

const fetchAllArticles = async () => {
  const queryString = strapiUtils.fetch.generateArticlesQueryString();
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const data = await response.json();
  return data;
};

export default async function Page() {
  const articles = await fetchAllArticles();

  return <Articles articles={articles} />;
}
