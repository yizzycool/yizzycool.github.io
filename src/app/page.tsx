import seoUtils from '@/utils/seo-utils';
import { fetchStrapiMediaByName } from '@/utils/strapi-utils';

import Home from '@/components/home';

export default async function HomePage() {
  const avatar = await fetchStrapiMediaByName('avatar.webp');

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
      <Home avatar={avatar} />
    </>
  );
}
