import type { BlogArticle } from '@/types/blog';

import { useMemo } from 'react';
import { CircleUserRound } from 'lucide-react';
import { get } from 'lodash';

import { ResponsiveStrapiImage } from '@/components/shared/responsive-strapi-image';

export default function Author({ article }: { article: BlogArticle }) {
  const data = get(article, 'data.0') || {};
  const { author, updatedAt } = data;

  const updateDate = useMemo(() => {
    const date = new Date(updatedAt);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [updatedAt]);

  return (
    <div className="flex items-center text-xs">
      <ResponsiveStrapiImage
        media={author?.avatar}
        width={32}
        height={32}
        sizes="32px"
        alt={
          author?.avatar?.alternativeText ||
          (author?.name ? `${author.name} avatar` : 'author avatar')
        }
        objectFit="cover"
        rounded="full"
        className="mr-4 h-8 w-8"
        srcSetOptions={{
          formats: ['thumbnail', 'small'],
          includeOriginal: false,
          fallbackFormat: 'thumbnail',
        }}
        fallback={<CircleUserRound className="mr-4 h-8 w-8 rounded-full" />}
      />
      <div>
        <div>{author?.name}</div>
        <div>{updateDate}</div>
      </div>
    </div>
  );
}
