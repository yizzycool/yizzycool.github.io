import { escapeRegExp } from 'lodash';

// Text highlighting search matches helper
export const highlightText = (text: string, search: string) => {
  if (!search.trim()) return text;
  try {
    const escapedSearch = escapeRegExp(search.trim());
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              className="rounded bg-amber-100 font-semibold text-neutral-900 dark:bg-amber-500/50 dark:text-neutral-100"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (_e) {
    return text;
  }
};
