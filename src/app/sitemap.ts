import type { MetadataRoute } from 'next';
import { Tools } from '@/components/header/components/tools-selector/data';
import _flatMap from 'lodash/flatMap';
import _map from 'lodash/map';

export const dynamic = 'force-static';

const ToolsSitemap: MetadataRoute.Sitemap = _flatMap(Tools, (tool) =>
  _map(tool.items, (item) => ({
    url: `https://yizzycool.github.io${item.href}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))
);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://yizzycool.github.io',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
      images: ['https://yizzycool.github.io/assets/images/home/avatar.png'],
    },
    ...ToolsSitemap,
  ];
}
