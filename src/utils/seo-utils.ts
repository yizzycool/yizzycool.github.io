import type { BlogArticle } from '@/types/blog';
import type { BlogCategoryData } from '@/types/blog/category';
import type { BlogTagData } from '@/types/blog/tag';

import urlJoin from 'url-join';
import { get, find, defaultsDeep } from 'lodash';

import strapiUtils from './strapi-utils';
import dataProcessUtils from './tools/data/data-process-utils';
import { ToolJsonLdSoftwareApplication } from '@/data/tools/metadata';
import { ToolGroupSlugs, ToolSlugs, ToolTitles } from '@/data/tools';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '';
const websiteName = process.env.NEXT_PUBLIC_WEBSITE_NAME || '';
const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME || '';
const logoUrl = urlJoin(domain, '/assets/images/header/logo.png');

const seoUtils = {
  // For /page.tsx
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

  // For /page.tsx
  generateSiteNavigationElement: () => {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          'name': 'YizzyPeasy',
          'url': domain,
        },
        {
          '@type': 'SiteNavigationElement',
          'id': 'site-navigation',
          'name': ['Home', 'Blog', 'Tools', 'Resume'],
          'url': [
            domain,
            urlJoin(domain, 'blog'),
            urlJoin(domain, 'tools'),
            urlJoin(domain, 'resume'),
          ],
        },
      ],
    };
  },

  generateToolsJsonLd: () => {
    const url = urlJoin(domain, 'tools');

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Tools Box | Yizzy Peasy',
      description:
        'Truly free daily utilities, image editors, developer toolkits, and Built-in Chrome AI Assistant. 真・完全免費的日常小工具、圖片編輯器、開發工具箱及 Chrome 內建 AI 助手。',
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: process.env.NEXT_PUBLIC_WEBSITE_NAME || 'Yizzy Peasy',
        url: domain,
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
    const tags = get(articles, ['data', 0, 'tags']);
    const tag = find(tags, (t) => t.slug === tagSlug) || {};
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
    const category = get(articles, ['data', 0, 'category'], {});
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
    const data = get(article, ['data', 0]);

    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      inLanguage: 'zh-TW',
      headline: data.title,
      description: data.metaDescription,
      image: strapiUtils.toMediaUrl(data.banner.url),
      datePublished: data.publishedAt ?? data.createdAt,
      dateModified: data.updatedAt ?? data.publishedAt ?? data.createdAt,
      articleSection: data.category?.name,
      keywords: (data.tags || [])
        .map((t: { name: string }) => t.name)
        .join(', '),
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

  // For /resume/page.tsx
  generateResumeJsonLd: () => {
    const url = urlJoin(domain, 'resume');

    return {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: authorName || 'Yizzy Wu',
        jobTitle: 'Senior Frontend Developer / Web Engineer',
        url: domain,
        sameAs: ['https://github.com/yizzycool', domain],
      },
      url,
    };
  },

  // For /resume/page.tsx
  generateResumeBreadcrumbJsonLd: () => {
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
          name: 'Resume',
          item: urlJoin(domain, 'resume'),
        },
      ],
    };
  },

  // For /blog/category/[category]/page.tsx
  generateCategoryBreadcrumbJsonLd: (
    categoryName: string,
    categorySlug: string
  ) => {
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
          name: categoryName,
          item: urlJoin(domain, 'blog/category', categorySlug),
        },
      ],
    };
  },

  // For /blog/page.tsx & /blog/page/[page]/page.tsx
  generateBlogBreadcrumbJsonLd: (page = 1) => {
    const breadcrumbList = {
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
      ],
    };

    if (page > 1) {
      breadcrumbList.itemListElement.push({
        '@type': 'ListItem',
        position: 3,
        name: `Blog - Page ${page}`,
        item: urlJoin(domain, `blog/page/${page}`),
      });
    }

    return breadcrumbList;
  },

  // For /blog/[category]/[article]/page.tsx
  generateBlogArticleBreadcrumbJsonLd: (article: BlogArticle) => {
    const data = get(article, ['data', 0]);

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
          item: urlJoin(domain, 'blog/category', data.category.slug),
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
      operatingSystem: 'All',
      browserRequirements: 'Requires HTML5, JavaScript',
      url,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@type': 'Person',
        name: authorName,
      },
    };

    const specificToolData = get(ToolJsonLdSoftwareApplication, toolKey, {});

    return defaultsDeep({}, specificToolData, customJsonLd);
  },

  // For /tools/page.tsx
  generateToolsBreadcrumbJsonLd: () => {
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
          name: 'Tools',
          item: urlJoin(domain, 'tools'),
        },
      ],
    };
  },

  // For /tools/<category>/<tool>/page.tsx
  generateEachToolBreadcrumbJsonLd: (toolKey: string) => {
    const toolGroupKey = dataProcessUtils.getToolGroupKeyByToolKey(toolKey);

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
          name: 'Tools',
          item: urlJoin(domain, 'tools'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${ToolTitles[toolKey]} | YizzyPeasy`,
          item: urlJoin(
            domain,
            'tools',
            ToolGroupSlugs[toolGroupKey],
            ToolSlugs[toolKey]
          ),
        },
      ],
    };
  },
};

export default seoUtils;
