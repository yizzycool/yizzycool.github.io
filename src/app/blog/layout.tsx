import LeftPanel from '@/components/blog/layout/left-panel';

const fetchCategoryArticles = async () => {
  const response = await fetch(
    `${process.env.STRAPI_URL}${process.env.STRAPI_LEFT_PANEL_DATA_URL}`
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
