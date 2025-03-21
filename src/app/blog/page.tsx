import AllArticles from '@/components/blog/all-articles';

const fetchAllArticles = async () => {
  const response = await fetch(
    `${process.env.STRAPI_URL}${process.env.STRAPI_ALL_DATA_URL}`
  );
  const data = await response.json();
  return data;
};

export default async function Page() {
  const articles = await fetchAllArticles();

  return <AllArticles articles={articles} />;
}
