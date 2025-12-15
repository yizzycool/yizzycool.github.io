import {
  ToolDescriptions,
  ToolGroupItems,
  ToolGroupKeysOrder,
  ToolGroupNames,
  ToolGroupSlugs,
  ToolSlugs,
  ToolTitles,
} from '@/data/tools';
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
        content: '',
        slug: ToolSlugs[itemKey],
        tags: [],
        category: ToolGroupNames[groupKey],
        categorySlug: ToolGroupSlugs[groupKey],
      }))
  );

  return Response.json(filteredData);
}
