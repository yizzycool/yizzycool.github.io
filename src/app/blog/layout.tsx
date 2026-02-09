import strapiUtils from '@/utils/strapi-utils';
import GlimmerBackground from '@/components/common/glimmer-background';
import GlimmerBackgroundConfigs from '@/data/glimmer-background-config/blog';
import LeftPanel from '@/components/blog/layout/left-panel';

export const fetchCategoryArticles = async () => {
  const queryString =
    strapiUtils.fetch.generateCategoriesQueryStringForLeftPanel();
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
    <main className="mx-auto flex min-h-dvh w-full max-w-full pt-[101px] 2xl:max-w-screen-2xl">
      <GlimmerBackground configs={GlimmerBackgroundConfigs} />
      <LeftPanel categoryArticles={categoryArticles} />
      {children}
    </main>
  );
}
