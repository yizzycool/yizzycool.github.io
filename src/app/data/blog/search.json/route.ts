import strapiUtils from '@/utils/strapi-utils';
import _map from 'lodash/map';

export const dynamic = 'force-static';

export async function GET() {
  const queryString = strapiUtils.getAllArticlesQueryStringForSearch();
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const { data } = await response.json();
  const filteredData = _map(data, (d) => ({
    title: d.title,
    description: d.description,
    content: d.content,
    slug: d.slug,
    tags: _map(d.tags, (tag) => tag.name),
    category: d.category.name,
  }));

  return Response.json(filteredData);
}
