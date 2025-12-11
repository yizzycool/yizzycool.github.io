import Fuse, { FuseResult } from 'fuse.js';
import { useEffect, useState } from 'react';
import _isEmpty from 'lodash/isEmpty';
import _isNull from 'lodash/isNull';

const fuseOptions = {
  // isCaseSensitive: false,
  includeScore: true,
  // ignoreDiacritics: false,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 1,
  // location: 0,
  // threshold: 0.6,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: [
    { name: 'title', weight: 1 },
    { name: 'description', weight: 1 },
    { name: 'content', weight: 1 },
    { name: 'slug', weight: 1 },
    { name: 'tags', weight: 1 },
    { name: 'category', weight: 1 },
    { name: 'categorySlug', weight: 1 },
  ],
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

    if (_isNull(data)) {
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
    if (_isEmpty(query)) {
      setSearchResults([]);
    } else if (fuse && !_isNull(data)) {
      const results = fuse.search(query);
      setSearchResults(results);
    }
  }, [query, fuse, data]);

  return {
    error,
    searchResults,
  };
}
