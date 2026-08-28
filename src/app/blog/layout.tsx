import { fetchCategoryArticles } from '@/utils/strapi-utils';
import GlimmerBackground from '@/components/common/glimmer-background';
import GlimmerBackgroundConfigs from '@/data/glimmer-background-config/blog';
import LeftPanel from '@/components/blog/layout/left-panel';
import VerticalLine from '@/components/blog/layout/vertical-line';
import ScrollToTop from '@/components/common/scroll-to-top';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryArticles = await fetchCategoryArticles();

  return (
    <main
      lang="zh-TW"
      className="mx-auto flex min-h-dvh w-full max-w-full pt-[101px] 2xl:max-w-screen-2xl"
    >
      <GlimmerBackground configs={GlimmerBackgroundConfigs} />
      <LeftPanel categoryArticles={categoryArticles} />
      <VerticalLine />
      <ScrollToTop />
      {children}
    </main>
  );
}
