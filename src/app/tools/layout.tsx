import '@/styles/globals.css';
import GlimmerBackground from '@/components/common/glimmer-background';
import GlimmerBackgroundConfigs from '@/data/glimmer-background-config/tools';
import FeaturePanel from '@/components/tools/layout/feature-panel';
import VerticalLine from '@/components/blog/layout/vertical-line';
import AboutBlock from '@/components/tools/common/about-block';
import ScrollToTop from '@/components/common/scroll-to-top';
import GlobalSnackbar from '@/components/tools/layout/global-snackbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-screen-2xl pt-[101px]">
      <GlimmerBackground configs={GlimmerBackgroundConfigs} />
      <FeaturePanel />
      <VerticalLine />
      <div className="mx-auto w-full min-w-0 flex-grow overflow-x-clip px-5 pb-20 pt-4 lg:max-w-screen-lg lg:px-10">
        {children}
        <AboutBlock />
      </div>
      <ScrollToTop />
      <GlobalSnackbar />
    </main>
  );
}
