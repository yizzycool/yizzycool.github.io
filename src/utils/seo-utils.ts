import type { BlogArticle } from '@/types/blog';
import urlJoin from 'url-join';
import strapiUtils from './strapi-utils';
import _get from 'lodash/get';
import _find from 'lodash/find';

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
  generateBlogJsonLd: () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Blog',
      url: urlJoin(domain, 'blog'),
      isPartOf: {
        '@type': 'WebSite',
        name: websiteName,
        url: domain,
      },
    };
  },

  // For /blog/[tag]/page.tsx
  generateBlogTagJsonLd: (articles: BlogArticle, tagSlug: string) => {
    const tags = _get(articles, ['data', 0, 'tags']);
    const tag = _find(tags, (t) => t.slug === tagSlug);
    const name = _get(tag, 'name', '');

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${name} Articles`,
      url: urlJoin(domain, 'blog'),
      isPartOf: {
        '@type': 'WebSite',
        name: websiteName,
        url: domain,
      },
    };
  },

  // For /blog/[category]/page.tsx
  generateBlogCategoryJsonLd: (articles: BlogArticle) => {
    const name = _get(articles, ['data', 0, 'category', 'name'], '');

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${name} Articles`,
      url: urlJoin(domain, 'blog'),
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
};

export default seoUtils;
