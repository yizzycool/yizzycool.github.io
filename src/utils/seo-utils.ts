import type { BlogArticle } from '@/types/blog';
import type { BlogCategoryData } from '@/types/blog/category';
import type { BlogTagData } from '@/types/blog/tag';
import urlJoin from 'url-join';
import strapiUtils from './strapi-utils';
import dataProcessUtils from './tools/data/data-process-utils';
import { ToolJsonLdSoftwareApplication } from '@/data/tools/metadata';
import _get from 'lodash/get';
import _find from 'lodash/find';
import _defaultsDeep from 'lodash/defaultsDeep';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '';
const websiteName = process.env.NEXT_PUBLIC_WEBSITE_NAME || '';
const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME || '';
const logoUrl = urlJoin(domain, '/assets/images/header/logo.png');

const seoUtils = {
  // For /layout.tsx
  generateWebSiteJsonLd: () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: websiteName,
      url: domain,
      publisher: {
        '@type': 'Organization',
        name: websiteName,
        url: domain,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
        },
      },
    };
  },

  // For /blog/page.tsx
  // For /blog/page/[page]/page.tsx
  generateBlogJsonLd: (page = 1) => {
    const name = page === 1 ? 'Blog' : `Blog - Page ${page}`;
    const url = urlJoin(domain, 'blog', page === 1 ? '' : `page/${page}`);

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: websiteName,
        url: domain,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
    };
  },

  // For /blog/[tag]/page.tsx
  // For /blog/[tag]/page/[page]/page.tsx
  generateBlogTagJsonLd: (
    articles: BlogArticle,
    tagSlug: string,
    page: number = 1
  ) => {
    const tags = _get(articles, ['data', 0, 'tags']);
    const tag = _find(tags, (t) => t.slug === tagSlug) || {};
    const { name: tagName } = tag as BlogTagData;

    const name =
      page === 1 ? `${tagName} Articles` : `${tagName} Articles - Page ${page}`;
    const url = urlJoin(
      domain,
      'blog/tag',
      tagSlug,
      page === 1 ? '' : `page/${page}`
    );

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: websiteName,
        url: domain,
      },
    };
  },

  // For /blog/category/[category]/page.tsx
  // For /blog/category/[category]/page/[page]/page.tsx
  generateBlogCategoryJsonLd: (articles: BlogArticle, page: number = 1) => {
    const category = _get(articles, ['data', 0, 'category'], {});
    const { name: categoryName = '', slug = '' } = category as BlogCategoryData;

    const name =
      page === 1
        ? `${categoryName} Articles`
        : `${categoryName} Articles - Page ${page}`;
    const url = urlJoin(
      domain,
      'blog/category',
      slug,
      page === 1 ? '' : `page/${page}`
    );

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: name,
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: websiteName,
        url: domain,
      },
    };
  },

  // For /blog/[category]/[article]/page.tsx
  generateBlogArticleJsonLd: (article: BlogArticle) => {
    const data = _get(article, ['data', 0]);

    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title,
      description: data.metaDescription,
      image: strapiUtils.toMediaUrl(data.banner.url),
      datePublished: data.publishedAt ?? data.createdAt,
      dateModified: data.updatedAt ?? data.publishedAt ?? data.createdAt,
      author: {
        '@type': 'Person',
        name: authorName,
        url: domain,
      },
      publisher: {
        '@type': 'Organization',
        name: websiteName,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': urlJoin(domain, 'blog', data.category.slug, data.slug),
      },
    };
  },

  // For /blog/[category]/[article]/page.tsx
  generateBlogArticleBreadcrumbJsonLd: (article: BlogArticle) => {
    const data = _get(article, ['data', 0]);

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: domain,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: urlJoin(domain, 'blog'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: data.category.name,
          item: urlJoin(domain, 'blog', data.category.slug),
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: data.title,
          item: urlJoin(domain, 'blog', data.category.slug, data.slug),
        },
      ],
    };
  },

  // For /tools/*/page.tsx
  generateToolJsonLd: (toolKey: string) => {
    const url = dataProcessUtils.getToolUrl(toolKey);

    const customJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      operatingSystem: 'Web',
      url,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    };

    return _defaultsDeep(customJsonLd, ToolJsonLdSoftwareApplication[toolKey]);
  },
};

export default seoUtils;
