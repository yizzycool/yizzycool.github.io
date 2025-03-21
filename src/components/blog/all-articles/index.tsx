'use client';

import _map from 'lodash/map';
import Image from 'next/image';

type MediaData = {
  width: number;
  height: number;
  url: string;
};

type Banner = {
  formats: {
    thumbnail: MediaData;
    small: MediaData;
    medium: MediaData;
    large: MediaData;
  };
} & MediaData;

type Tag = {
  name: string;
};

type Author = {
  name: string;
};

type Article = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  url: string;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
  banner: Banner;
  tags: Array<Tag>;
  author: Author;
};

type Articles = {
  data: Array<Article>;
  meta?: object;
};

export default function AllArticles({ articles }: { articles: Articles }) {
  const { data } = articles || {};

  return (
    <div className="mx-auto max-w-screen-lg">
      <h1 className="mx-auto my-10 text-center text-xl font-bold">
        All Articles
      </h1>
      {_map(data, (article) => (
        <div
          key={article.documentId}
          className="flex cursor-pointer border-b border-neutral-400/20 px-4 py-8 hover:bg-neutral-400/5"
        >
          <Image
            width="300"
            height="300"
            src={`${process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL}${article.banner.formats.thumbnail.url}`}
            alt="thumbnail"
            className="mr-8 aspect-video w-1/4 max-w-[300px] object-cover"
          />
          <div>
            <div className="text-lg font-bold">{article.title}</div>
            <div className="mt-4 text-neutral-400">{article.description}</div>
            <div className="mt-12 flex gap-2">
              {_map(article.tags, (tag) => (
                <div
                  key={tag.name}
                  className="rounded-md bg-neutral-400/20 px-2 py-1 text-xs"
                >
                  {tag.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
