import type { BlogArticle } from '@/types/blog';

import Image from 'next/image';
import { useMemo } from 'react';
import { CircleUserRound } from 'lucide-react';
import { get } from 'lodash';

import strapiUtils from '@/utils/strapi-utils';

export default function Author({ article }: { article: BlogArticle }) {
  const data = get(article, 'data.0') || {};
  const { author, updatedAt } = data;

  const avatarUrl = useMemo(() => {
    const avatarPath = get(author, 'avatar.formats.thumbnail.url') || '';
    return avatarPath ? strapiUtils.toMediaUrl(avatarPath) : '';
  }, [author]);

  const updateDate = useMemo(() => {
    const date = new Date(updatedAt);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [updatedAt]);

  return (
    <div className="flex items-center text-xs">
      {avatarUrl ? (
        <Image
          className="mr-4 h-8 w-8 rounded-full"
          width={30}
          height={30}
          alt="author avatar"
          src={avatarUrl}
        />
      ) : (
        <CircleUserRound className="mr-4 h-8 w-8 rounded-full" />
      )}
      <div>
        <div>{author.name}</div>
        <div>{updateDate}</div>
      </div>
    </div>
  );
}
