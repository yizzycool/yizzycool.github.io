'use client';

import type { BlogArticle } from '@/types/blog';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import ArticlesContent from './articles-content';

type Props = {
  articles: BlogArticle;
  categorySlug?: string;
};

export default function ArticlesClient({ articles, categorySlug }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const rawTag = searchParams.get('tag')?.trim() || null;
  const activeTagSlug = !categorySlug ? rawTag : null;

  const rawPage = Number.parseInt(searchParams.get('page') || '1', 10);
  const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams();
    if (activeTagSlug) {
      params.set('tag', activeTagSlug);
    }
    if (nextPage > 1) {
      params.set('page', nextPage.toString());
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearTag = () => {
    router.push('/blog', { scroll: false });
  };

  return (
    <ArticlesContent
      articles={articles}
      categorySlug={categorySlug}
      activeTagSlug={activeTagSlug}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      onClearTag={handleClearTag}
    />
  );
}
