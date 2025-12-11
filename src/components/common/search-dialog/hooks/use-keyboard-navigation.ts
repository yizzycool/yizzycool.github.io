import { FuseResult } from 'fuse.js';
import { KeyboardEventHandler, useEffect, useMemo, useState } from 'react';
import _last from 'lodash/last';
import _get from 'lodash/get';
import _flatten from 'lodash/flatten';
import urlJoin from 'url-join';
import { useRouter } from 'next/navigation';

type Props = {
  filteredResults: Array<Array<FuseResult<DataForSearch> & { idx: number }>>;
  closeDialog: () => void;
};

export default function useKeyboardNavigation({
  filteredResults,
  closeDialog,
}: Props) {
  const [focusIndex, setFocusIndex] = useState(0);
  const [usingKeyboard, setUsingKeyboard] = useState(false);

  const router = useRouter();

  const flattenFilteredResults = useMemo(() => {
    return _flatten(filteredResults);
  }, [filteredResults]);

  // Scroll keyboard-selected element into view
  useEffect(() => {
    if (!usingKeyboard) return;
    const node = document.getElementById(`search-result-${focusIndex}`);
    if (!node) return;
    node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    setUsingKeyboard(false);
  }, [focusIndex, usingKeyboard]);

  const onDialogKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'ArrowUp') {
      setFocusIndex((prev) => Math.max(0, prev - 1));
      setUsingKeyboard(true);
    } else if (e.key === 'ArrowDown') {
      setFocusIndex((prev) =>
        Math.min(flattenFilteredResults.length - 1, prev + 1)
      );
      setUsingKeyboard(true);
    } else if (e.key === 'Enter') {
      redirectToPage();
    }
  };

  const redirectToPage = () => {
    const data = _get(flattenFilteredResults, focusIndex);
    const { page, slug, categorySlug } = data.item;
    const url = urlJoin('/', page, categorySlug, slug);
    router.push(url);
    closeDialog();
  };

  const onPointerEnter = (idx: number) => {
    if (usingKeyboard) return;
    setFocusIndex(idx);
  };

  return { focusIndex, onPointerEnter, onDialogKeyDown };
}
