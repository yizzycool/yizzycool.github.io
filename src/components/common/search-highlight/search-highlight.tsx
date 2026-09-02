import { escapeRegExp } from 'lodash';

type SearchHighlightProps = {
  text: string;
  search: string;
  className?: string;
  highlightClassName?: string;
};

export function SearchHighlight({
  text,
  search,
  className,
  highlightClassName = 'rounded bg-amber-100 font-semibold text-slate-900 dark:bg-amber-500/50 dark:text-slate-100',
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
