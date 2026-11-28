import type { BlogArticle } from '@/types/blog';
import type { BlogArticleData } from '@/types/blog/article';

import { map } from 'lodash';

import strapiUtils from '@/utils/strapi-utils';

export const dynamic = 'force-static';

const SEARCH_PAGE_SIZE = 100;

export async function GET() {
  try {
    const allData: BlogArticleData[] = [];
    let page = 1;
    let pageCount = 1;

    while (page <= pageCount) {
      const queryString =
        strapiUtils.staticRoute.generateArticlesQueryStringForSearch(
          undefined,
          {
            page,
            pageSize: SEARCH_PAGE_SIZE,
          }
        );
      const response = await fetch(
        `${process.env.STRAPI_URL}/api/articles?${queryString}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: BlogArticle = await response.json();
      if (Array.isArray(result.data)) {
        allData.push(...result.data);
      }
      pageCount = result.meta?.pagination?.pageCount ?? 1;
      page += 1;
    }

    const filteredData: Array<DataForSearch> = map(allData, (dt) => ({
      page: 'blog',
      title: dt.title,
      description: dt.description,
      content: '', // or dt.content
      slug: dt.slug,
      tags: map(dt.tags || [], (tag) => tag.name),
      category: dt.category?.name || '',
      categorySlug: dt.category?.slug || '',
    }));

    return Response.json(filteredData);
  } catch (error) {
    console.warn('Error generating search data:', error);
    return Response.json([]);
  }
}
