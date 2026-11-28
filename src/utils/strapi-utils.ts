import type { BlogArticle, BlogCategory } from '@/types/blog';
import type { BlogArticleData } from '@/types/blog/article';
import type { BlogCategoryData } from '@/types/blog/category';
import type {
  BlogMediaData,
  BlogMediaFormat,
  BlogMediaFormatKey,
  BlogMediaFormats,
} from '@/types/blog/media';

import urlJoin from 'url-join';
import qs from 'qs';
import { defaults } from 'lodash';

export type StrapiSrcSetResult = {
  /** Fallback image URL for browsers/crawlers that do not evaluate srcSet */
  src: string;
  /** Responsive width-descriptor srcSet (e.g. "url1 500w, url2 750w"), or undefined when no responsive variants exist */
  srcSet: string | undefined;
};

export type BuildStrapiSrcSetOptions = {
  /** Strapi format keys to include in srcSet (default: ['small', 'medium', 'large']) */
  formats?: ReadonlyArray<BlogMediaFormatKey>;
  /** Whether to include the original full-resolution media.url with media.width in srcSet for high-DPR/large screens (default: true) */
  includeOriginal?: boolean;
  /** Preferred format for the fallback `src` attribute; falls back to `media.url` if unavailable (default: 'large') */
  fallbackFormat?: BlogMediaFormatKey | 'original';
};

type QueryObject = {
  status: 'published' | 'draft';
  populate?: object;
  fields?: object;
  filters?: object;
  pagination?: object;
  sort?: object;
};

const PAGINATION = {
  page: 1,
  pageSize: 10,
};

const STRAPI_MAX_PAGE_SIZE = 100;

type StrapiPaginatedResponse<T> = {
  data?: T[];
  meta?: {
    pagination?: {
      page?: number;
      pageSize?: number;
      pageCount?: number;
      total?: number;
    };
  };
};

type CategoryStaticParamItem = {
  slug?: string | null;
};

type ArticleStaticParamItem = {
  slug?: string | null;
  category?: {
    slug?: string | null;
  } | null;
};

const DEFAULT_SRCSET_FORMATS: ReadonlyArray<BlogMediaFormatKey> = [
  'small',
  'medium',
  'large',
];

const isAbsoluteMediaUrl = (url: string): boolean =>
  /^(https?:\/\/|\/\/|data:|blob:)/i.test(url);

const encodeSrcSetUrl = (url: string): string =>
  url.replace(/ /g, '%20').replace(/,/g, '%2C');

const resolveMediaUrl = (url: string): string => {
  if (!url) return '';
  if (isAbsoluteMediaUrl(url)) return url;

  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL;
  return baseUrl ? urlJoin(baseUrl, url) : url;
};

/**
 * Build `src` and width-descriptor `srcSet` from a Strapi media object so the browser
 * can pick the optimal resolution based on viewport width, `sizes`, and device pixel ratio.
 */
export const buildStrapiSrcSet = (
  media: BlogMediaData | null | undefined,
  options: BuildStrapiSrcSetOptions = {}
): StrapiSrcSetResult => {
  if (!media?.url) {
    return { src: '', srcSet: undefined };
  }

  const {
    formats = DEFAULT_SRCSET_FORMATS,
    includeOriginal = true,
    fallbackFormat = 'large',
  } = options;

  // Fall back directly to media.url when the preferred format is missing so smaller
  // originals are never downgraded to a lower-resolution breakpoint.
  const rawFallbackUrl =
    fallbackFormat === 'original'
      ? media.url
      : (media.formats?.[fallbackFormat]?.url ?? media.url);
  const src = resolveMediaUrl(rawFallbackUrl);

  const candidatesByWidth = new Map<number, string>();
  const seenUrls = new Set<string>();

  const addCandidate = (width: number | null | undefined, rawUrl: string) => {
    if (!rawUrl || width == null || !(width > 0)) return;

    const resolvedUrl = encodeSrcSetUrl(resolveMediaUrl(rawUrl));
    if (
      resolvedUrl &&
      !candidatesByWidth.has(width) &&
      !seenUrls.has(resolvedUrl)
    ) {
      candidatesByWidth.set(width, resolvedUrl);
      seenUrls.add(resolvedUrl);
    }
  };

  for (const key of formats) {
    const format = media.formats?.[key];
    if (format) {
      addCandidate(format.width, format.url);
    }
  }

  if (includeOriginal) {
    addCandidate(media.width, media.url);
  }

  const sortedEntries = Array.from(candidatesByWidth.entries()).sort(
    ([widthA], [widthB]) => widthA - widthB
  );

  const encodedSrc = encodeSrcSetUrl(src);
  const srcSet =
    sortedEntries.length === 0 ||
    (sortedEntries.length === 1 && sortedEntries[0][1] === encodedSrc)
      ? undefined
      : sortedEntries.map(([width, url]) => `${url} ${width}w`).join(', ');

  return { src, srcSet };
};

const strapiUtils = {
  toBlogCategoryUrl: (categorySlug: string) => {
    return urlJoin('/blog/category', categorySlug);
  },
  toBlogTagUrl: (tagSlug: string) => {
    return `/blog?tag=${encodeURIComponent(tagSlug)}`;
  },
  toBlogCategoryArticleUrl: (categorySlug: string, articleSlug: string) => {
    return urlJoin('/blog', categorySlug, articleSlug);
  },
  toMediaUrl: resolveMediaUrl,

  /** @deprecated Use `buildStrapiSrcSet` instead. */
  buildSrcSet: (
    formats?:
      | BlogMediaFormats
      | Record<string, BlogMediaFormat | undefined>
      | null
  ): string => {
    if (!formats) return '';

    return Object.values(formats)
      .filter((f): f is BlogMediaFormat => Boolean(f?.url && f.width > 0))
      .sort((a, b) => a.width - b.width)
      .map((f) => `${encodeSrcSetUrl(resolveMediaUrl(f.url))} ${f.width}w`)
      .join(', ');
  },

  buildStrapiSrcSet,

  // Used for fetch Strapi data
  fetch: {
    // /blog/layout.tsx
    generateCategoriesQueryStringForLeftPanel: (
      filters?: object | undefined,
      pagination?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        populate: {
          articles: {
            fields: ['title', 'shortTitle', 'slug'],
            // sort: ['shortTitle'],
          },
        },
        pagination: defaults(pagination, {
          page: 1,
          pageSize: STRAPI_MAX_PAGE_SIZE,
        }),
        filters,
        sort: ['order'],
      };
      return qs.stringify(queryObject);
    },

    // /blog/page.tsx
    // /blog/category/[category]/page.tsx
    generateArticlesQueryString: (
      filters?: object | undefined,
      pagination?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        populate: ['banner', 'tags', 'category'],
        fields: [
          'title',
          'description',
          'createdAt',
          'updatedAt',
          'publishedAt',
          'slug',
          'readTime',
        ],
        pagination: defaults(pagination, PAGINATION),
        filters,
        sort: ['createdAt:desc'],
      };
      return qs.stringify(queryObject);
    },

    // /blog/[category]/[article]/page.tsx
    generateArticleQueryString: (filters?: object | undefined) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        populate: {
          banner: true,
          tags: true,
          category: true,
          author: {
            populate: {
              avatar: true,
            },
          },
          collection: {
            populate: {
              articles: {
                fields: ['title', 'slug'],
                populate: ['category'],
                // sort: ['createdAt'],
              },
            },
          },
        },
        filters,
      };
      return qs.stringify(queryObject);
    },

    // To get previous / next article
    // /blog/[category]/[article]/page.tsx
    generatePrevNextArticleInfoQueryString: (
      filters?: object | undefined,
      sort?: string[]
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        fields: ['title', 'shortTitle', 'slug'],
        populate: {
          tags: true,
          category: true,
        },
        pagination: { limit: 1 },
        filters,
        sort,
      };
      return qs.stringify(queryObject);
    },
  },

  // Used for generateStaticParams
  staticParams: {
    // /blog/category/[category]/page.tsx
    generateCategoriesQueryStringForCategorPage: (
      filters?: object | undefined,
      pagination?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        fields: ['slug'],
        pagination: defaults(pagination, {
          page: 1,
          pageSize: STRAPI_MAX_PAGE_SIZE,
        }),
        filters,
      };
      return qs.stringify(queryObject);
    },

    // /blog/[category]/[article]/page.tsx
    generateArticlesQueryStringForStaticParams: (
      filters?: object | undefined,
      pagination?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        fields: ['slug'],
        populate: {
          category: {
            fields: ['slug'],
          },
        },
        pagination: defaults(pagination, {
          page: 1,
          pageSize: STRAPI_MAX_PAGE_SIZE,
        }),
        filters,
      };
      return qs.stringify(queryObject);
    },
  },

  // Used for static route handler
  staticRoute: {
    // /data/blog/search.json/route.ts
    generateArticlesQueryStringForSearch: (
      filters?: object | undefined,
      pagination?: object | undefined
    ) => {
      const queryObject: QueryObject = {
        status: process.env.NEXT_PUBLIC_ENV === 'prod' ? 'published' : 'draft',
        populate: ['tags', 'category'],
        fields: ['title', 'description', 'slug'],
        filters,
        pagination: defaults(pagination, PAGINATION),
      };
      return qs.stringify(queryObject);
    },
  },
};

async function fetchPaginatedStrapiCollection<T>(
  endpoint: string,
  buildQueryString: (pagination: { page: number; pageSize: number }) => string
): Promise<T[]> {
  const allData: T[] = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const queryString = buildQueryString({
      page,
      pageSize: STRAPI_MAX_PAGE_SIZE,
    });
    const response = await fetch(
      `${process.env.STRAPI_URL}${endpoint}?${queryString}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: StrapiPaginatedResponse<T> = await response.json();
    if (Array.isArray(result.data)) {
      allData.push(...result.data);
    }
    pageCount = result.meta?.pagination?.pageCount ?? 1;
    page += 1;
  }

  return allData;
}

export const fetchAllArticles = async (
  filters?: object
): Promise<BlogArticle> => {
  try {
    const allData = await fetchPaginatedStrapiCollection<BlogArticleData>(
      '/api/articles',
      (pagination) =>
        strapiUtils.fetch.generateArticlesQueryString(filters, pagination)
    );

    return {
      data: allData,
      meta: {
        pagination: {
          page: 1,
          pageSize: allData.length || STRAPI_MAX_PAGE_SIZE,
          pageCount: allData.length > 0 ? 1 : 0,
          total: allData.length,
        },
      },
    };
  } catch (error) {
    console.warn('Error fetching all articles:', error);
    return {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: 10,
          pageCount: 0,
          total: 0,
        },
      },
    };
  }
};

export const fetchCategoryArticles = async (): Promise<BlogCategory> => {
  try {
    const allData = await fetchPaginatedStrapiCollection<BlogCategoryData>(
      '/api/categories',
      (pagination) =>
        strapiUtils.fetch.generateCategoriesQueryStringForLeftPanel(
          undefined,
          pagination
        )
    );

    return {
      data: allData,
      meta: {
        pagination: {
          page: 1,
          pageSize: allData.length || STRAPI_MAX_PAGE_SIZE,
          pageCount: allData.length > 0 ? 1 : 0,
          total: allData.length,
        },
      },
    };
  } catch (error) {
    console.warn('Error fetching category articles:', error);
    return {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: 10,
          pageCount: 0,
          total: 0,
        },
      },
    };
  }
};

export const fetchAllCategoryStaticParams = async (): Promise<
  Array<{ category: string }>
> => {
  try {
    const categories =
      await fetchPaginatedStrapiCollection<CategoryStaticParamItem>(
        '/api/categories',
        (pagination) =>
          strapiUtils.staticParams.generateCategoriesQueryStringForCategorPage(
            undefined,
            pagination
          )
      );

    return categories.flatMap(({ slug }) => (slug ? [{ category: slug }] : []));
  } catch (error) {
    console.warn('Error generating static params for category:', error);
    return [];
  }
};

export const fetchAllArticleStaticParams = async (): Promise<
  Array<{ category: string; article: string }>
> => {
  try {
    const articles =
      await fetchPaginatedStrapiCollection<ArticleStaticParamItem>(
        '/api/articles',
        (pagination) =>
          strapiUtils.staticParams.generateArticlesQueryStringForStaticParams(
            undefined,
            pagination
          )
      );

    return articles.flatMap(({ slug, category }) =>
      category?.slug && slug ? [{ category: category.slug, article: slug }] : []
    );
  } catch (error) {
    console.warn('Error generating static params for articles:', error);
    return [];
  }
};

export const fetchStrapiMediaByName = async (
  name: string
): Promise<BlogMediaData | null> => {
  try {
    const queryString = qs.stringify({
      filters: { name: { $eq: name } },
      sort: ['createdAt:desc'],
    });
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/upload/files?${queryString}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const files: BlogMediaData[] = await response.json();
    return Array.isArray(files) ? (files[0] ?? null) : null;
  } catch (error) {
    console.warn(`Error fetching Strapi media "${name}":`, error);
    return null;
  }
};

export default strapiUtils;
