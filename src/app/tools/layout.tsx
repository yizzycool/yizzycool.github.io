import '@/styles/globals.css';
import GlimmerBackground from '@/components/common/glimmer-background';
import GlimmerBackgroundConfigs from '@/data/glimmer-background-config/tools';
import FeaturePanel from '@/components/tools/layout/feature-panel';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-2xl pt-[68px]">
      <GlimmerBackground configs={GlimmerBackgroundConfigs} />
      <FeaturePanel />
      <div className="relative flex-1">
        <div className="mx-auto h-full min-h-full max-w-screen-lg px-4 py-8 text-center sm:px-6 lg:px-12 lg:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
