'use client';

import SupportTable from '@/components/tools/web-detection-api/components/support-table';
import DiscoverMoreFeatures from '@/components/tools/components/discover-more-features';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <DiscoverMoreFeatures type="chromeDetectionApi" />
      <SupportTable />
    </>
  );
}
