import '@/styles/globals.css';
import FeaturePanel from '@/components/tools/layout/feature-panel';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex max-w-screen-2xl">
      <FeaturePanel />
      <div className="flex-1">{children}</div>
    </div>
  );
}
