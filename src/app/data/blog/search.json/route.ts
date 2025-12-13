import strapiUtils from '@/utils/strapi-utils';
import _map from 'lodash/map';

export const dynamic = 'force-static';

export async function GET() {
  const queryString =
    strapiUtils.staticRoute.generateArticlesQueryStringForSearch();
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const { data } = await response.json();
  const filteredData: Array<DataForSearch> = _map(data, (dt) => ({
    page: 'blog',
    title: dt.title,
    description: dt.description,
    content: dt.content,
    slug: dt.slug,
    tags: _map(dt.tags, (tag) => tag.name),
    category: dt.category.name,
    categorySlug: dt.category.slug,
  }));

  return Response.json(filteredData);
}
