import strapiUtils from '@/utils/strapi-utils';
import LeftPanel from '@/components/blog/layout/left-panel';

export const fetchCategoryArticles = async () => {
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
    <div className="mx-auto flex min-h-dvh w-full max-w-full pt-[68px] 2xl:max-w-screen-2xl">
      <LeftPanel categoryArticles={categoryArticles} />
      {children}
    </div>
  );
}
