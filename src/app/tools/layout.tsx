import '@/styles/globals.css';
import { GlimmerBackground } from '@/components/ui/glimmer-background';
import GlimmerBackgroundConfigs from '@/data/glimmer-background-config/tools';
import FeaturePanel from '@/components/tools/layout/feature-panel';
import { CollapsibleSidebar } from '@/components/shared/collapsible-sidebar';
import AboutBlock from '@/components/tools/common/about-block';
import RelatedToolsBlock from '@/components/tools/common/related-tools-block';
import { ScrollToTop } from '@/components/shared/scroll-to-top';
import GlobalSnackbar from '@/components/tools/layout/global-snackbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-dvh pt-[101px]">
      <GlimmerBackground configs={GlimmerBackgroundConfigs} />
      <CollapsibleSidebar scope="tools" title="Tools">
        <FeaturePanel />
      </CollapsibleSidebar>
      <main className="mx-auto w-full min-w-0 max-w-full flex-grow overflow-x-clip px-5 pb-20 pt-4 lg:px-10 xl:max-w-screen-xl">
        {children}
        <RelatedToolsBlock />
        <AboutBlock />
      </main>
      <ScrollToTop />
      <GlobalSnackbar />
    </div>
  );
}
