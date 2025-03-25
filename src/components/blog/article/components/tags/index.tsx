import { BlogArticle } from '@/types/blog';
import _get from 'lodash/get';
import _map from 'lodash/map';

export default function Tags({ article }: { article: BlogArticle }) {
  const data = _get(article, 'data.0') || {};
  const { tags } = data;

  return (
    <div className="flex gap-2">
      {_map(tags, (tag) => (
        <div
          key={tag.name}
          className="rounded-md bg-neutral-400/20 px-2 py-1 text-xs"
        >
          {tag.name}
        </div>
      ))}
    </div>
  );
}
