import strapiUtils from '@/utils/strapi-utils';
import LeftPanel from '@/components/blog/layout/left-panel';

const fetchCategoryArticles = async () => {
  const queryString = strapiUtils.getCategoryArticlesQueryString();
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/categories?${queryString}`
  );
  const data = await response.json();
  return data;
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryArticles = await fetchCategoryArticles();

  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-2xl pt-[68px]">
      <LeftPanel categoryArticles={categoryArticles} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
