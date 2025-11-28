import '@/styles/globals.css';
import FeaturePanel from '@/components/tools/layout/feature-panel';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-2xl pt-[68px]">
      <FeaturePanel />
      <div className="flex-1">
        <div className="mx-auto min-h-full max-w-screen-lg p-4 text-center sm:p-6 lg:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}
