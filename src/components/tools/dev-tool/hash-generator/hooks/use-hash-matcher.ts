'use client';

import type { HashAlgorithm, HashResultItem } from '../types';

import { useMemo, useState } from 'react';

export function useHashMatcher(results: HashResultItem[]) {
  const [targetHash, setTargetHash] = useState<string>('');

  const cleanTarget = useMemo(() => {
    return targetHash.trim().toLowerCase();
  }, [targetHash]);

  const matchInfo = useMemo(() => {
    if (!cleanTarget) {
      return {
        hasTarget: false,
        isMatching: false,
        matchedAlgorithm: null,
      };
    }

    const matched = results.find((item) => {
      if (!item.hex && !item.base64) return false;
      const lowerHex = item.hex.toLowerCase();
      const rawBase64 = item.base64;
      return lowerHex === cleanTarget || rawBase64 === targetHash.trim();
    });

    return {
      hasTarget: true,
      isMatching: Boolean(matched),
      matchedAlgorithm: matched ? (matched.algorithm as HashAlgorithm) : null,
    };
  }, [cleanTarget, targetHash, results]);

  const isMatchedAlgorithm = (algo: HashAlgorithm): boolean => {
    return matchInfo.isMatching && matchInfo.matchedAlgorithm === algo;
  };

  const handleClearTarget = () => {
    setTargetHash('');
  };

  return {
    targetHash,
    setTargetHash,
    hasTarget: matchInfo.hasTarget,
    isMatching: matchInfo.isMatching,
    matchedAlgorithm: matchInfo.matchedAlgorithm,
    isMatchedAlgorithm,
    onClearTarget: handleClearTarget,
  };
}

export default useHashMatcher;
