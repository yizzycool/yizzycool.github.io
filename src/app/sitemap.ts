import type { MetadataRoute } from 'next';
import { Tools } from '@/components/header/components/tools-selector/data';
import _flatMap from 'lodash/flatMap';
import _map from 'lodash/map';

export const dynamic = 'force-static';

const getDate = () => new Date().toISOString().split('T')[0];

const ToolsSitemap: MetadataRoute.Sitemap = _flatMap(Tools, (tool) =>
  _map(tool.items, (item) => ({
    url: `https://yizzycool.github.io${item.href}`,
    lastModified: getDate(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))
);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://yizzycool.github.io',
      lastModified: getDate(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    ...ToolsSitemap,
  ];
}
