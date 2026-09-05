import type { SearchHighlightProps } from './types';

import { escapeRegExp } from 'lodash';
import { defaultSearchHighlightClassName } from './search-highlight.variants';

export function SearchHighlight({
  text,
  search,
  className,
  highlightClassName = defaultSearchHighlightClassName,
}: SearchHighlightProps) {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) {
    return <span className={className}>{text}</span>;
  }

  const escapedSearch = escapeRegExp(trimmedSearch);
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmedSearch.toLowerCase() ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
