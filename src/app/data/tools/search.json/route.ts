import {
  ToolDescriptions,
  ToolGroupItems,
  ToolGroupKeysOrder,
  ToolGroupNames,
  ToolGroupSlugs,
  ToolSlugs,
  ToolTitles,
} from '@/data/tools';
import { ToolTags } from '@/data/tools/tags';

import _flatMap from 'lodash/flatMap';
import _map from 'lodash/map';

export const dynamic = 'force-static';

export async function GET() {
  const filteredData: Array<DataForSearch> = _flatMap(
    ToolGroupKeysOrder,
    (groupKey) =>
      _map(ToolGroupItems[groupKey], (itemKey) => ({
        page: 'tools',
        title: ToolTitles[itemKey],
        description: ToolDescriptions[itemKey],
        content: '', // or ToolAbout[itemKey]
        slug: ToolSlugs[itemKey],
        tags: ToolTags[itemKey],
        category: ToolGroupNames[groupKey],
        categorySlug: ToolGroupSlugs[groupKey],
      }))
  );

  return Response.json(filteredData);
}
