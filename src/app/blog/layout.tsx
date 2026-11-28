import { fetchCategoryArticles } from '@/utils/strapi-utils';
import LeftPanel from '@/components/blog/layout/left-panel';
import { CollapsibleSidebar } from '@/components/shared/collapsible-sidebar';
import { ScrollToTop } from '@/components/shared/scroll-to-top';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryArticles = await fetchCategoryArticles();

  return (
    <main
      lang="zh-TW"
      className="mx-auto flex min-h-dvh w-full max-w-full overflow-x-clip pt-[101px]"
    >
      <CollapsibleSidebar scope="blog" title="Blog">
        <LeftPanel categoryArticles={categoryArticles} />
      </CollapsibleSidebar>
      <ScrollToTop />
      {children}
    </main>
  );
}
