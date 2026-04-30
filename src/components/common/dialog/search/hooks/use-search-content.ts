import Fuse, { FuseResult } from 'fuse.js';
import { useEffect, useState } from 'react';
import { isEmpty, isNull } from 'lodash';

const fuseOptions = {
  // --- Basic Options ---
  // isCaseSensitive: false,
  // ignoreDiacritics: false,
  includeScore: true, // default: false
  // includeMatches: false,
  // minMatchCharLength: 1,
  // shouldSort: true,
  // findAllMatches: false,
  keys: [
    { name: 'title', weight: 5.0 },
    { name: 'tags', weight: 3.0 },
    { name: 'category', weight: 2.0 },
    { name: 'description', weight: 1.5 },
    { name: 'slug', weight: 1.0 },
    { name: 'categorySlug', weight: 1.0 },
    // { name: 'content', weight: 0.1 },
  ],

  // --- Fuzzy Matching Options ---
  // location: 0,
  threshold: 0.3, // default: 0.6
  // distance: 100,
  ignoreLocation: true, // default: false

  // --- Advanced Options ---
  // useExtendedSearch: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
};

type Props = {
  isOpen: boolean;
  query: string;
  dataUrl: string;
};

export default function useSearchContent({ isOpen, query, dataUrl }: Props) {
  const [data, setData] = useState<Array<DataForSearch> | null>(null);
  const [error, setError] = useState(false);
  const [fuse, setFuse] = useState<Fuse<DataForSearch> | null>(null);
  const [searchResults, setSearchResults] = useState<
    Array<FuseResult<DataForSearch>>
  >([]);

  // Init Fuse and Fetch `articles` or `tools`
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const data = await fetch(dataUrl).then((r) => r.json());
        setData(data);
      } catch (e) {
        console.log('error when fetching data:', e);
        setError(true);
      }
    };

    if (!fuse) {
      const newFuse = new Fuse([], fuseOptions);
      setFuse(newFuse);
    }

    if (isNull(data)) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Add data collection into fuse
  useEffect(() => {
    if (!fuse || !data) return;
    fuse.setCollection(data);
  }, [fuse, data]);

  // Update result
  useEffect(() => {
    if (isEmpty(query)) {
      setSearchResults([]);
    } else if (fuse && !isNull(data)) {
      const results = fuse.search(query);
      setSearchResults(results);
    }
  }, [query, fuse, data]);

  return {
    error,
    searchResults,
  };
}
