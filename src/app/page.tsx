import seoUtils from '@/utils/seo-utils';

import { GlimmerBackground } from '@/components/ui/glimmer-background';
import GlimmerBackgroundConfigs from '@/data/glimmer-background-config/home';
import Home from '@/components/home';

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateWebSiteJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateSiteNavigationElement()),
        }}
      />
      <GlimmerBackground configs={GlimmerBackgroundConfigs} />
      <Home />
    </>
  );
}
