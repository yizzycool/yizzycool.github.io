import type { TdxCctvData } from '@/data/tools/everyday-life-tool/taiwan-live-cams/cctv';

import { useState, useEffect } from 'react';

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export function useGetCctv() {
  const [data, setData] = useState<TdxCctvData | null>(null);
  const [status, setStatus] = useState<FetchState>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setStatus('loading');
      setError(null);

      try {
        const response = await fetch(
          `/data/tools/everyday-life-tool/taiwan-live-cams/cctv.json`
        );

        if (!response.ok) {
          throw new Error(`cannot fetch data: ${response.status}`);
        }

        const json = await response.json();

        setData(json);
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('unknown error'));
        setStatus('error');
      }
    };

    fetchData();
  }, []);

  return {
    data,
    error,
    isLoading: ['idle', 'loading'].includes(status),
    isError: status === 'error',
  };
}
