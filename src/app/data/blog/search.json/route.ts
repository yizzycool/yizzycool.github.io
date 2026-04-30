import { map } from 'lodash';

import strapiUtils from '@/utils/strapi-utils';

export const dynamic = 'force-static';

export async function GET() {
  const queryString =
    strapiUtils.staticRoute.generateArticlesQueryStringForSearch(undefined, {
      pageSize: 9999,
    });
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/articles?${queryString}`
  );
  const { data } = await response.json();
  const filteredData: Array<DataForSearch> = map(data, (dt) => ({
    page: 'blog',
    title: dt.title,
    description: dt.description,
    content: '', // or dt.content
    slug: dt.slug,
    tags: map(dt.tags, (tag) => tag.name),
    category: dt.category.name,
    categorySlug: dt.category.slug,
  }));

  return Response.json(filteredData);
}
