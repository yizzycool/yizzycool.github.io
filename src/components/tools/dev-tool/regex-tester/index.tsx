'use client';

import { useEffect, useState } from 'react';
import HeaderBlock from '../../components/header-block';
import SectionGap from '../../components/section-gap';
import PatternCard from './components/pattern-card';
import TestCard from './components/test-card';
import DetailCard from './components/detail-card';

import _filter from 'lodash/filter';

export type RegexColorType = {
  bg: string;
  text: string;
  border: string;
};

export const RegexColors: Array<RegexColorType> = [
  {
    bg: 'bg-blue-400/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/50',
  },
  {
    bg: 'bg-emerald-400/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/50',
  },
  {
    bg: 'bg-amber-400/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/50',
  },
  {
    bg: 'bg-rose-400/30',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/50',
  },
  {
    bg: 'bg-purple-400/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/50',
  },
];

export const RegexFlags = [
  { key: 'g', label: 'global' },
  { key: 'i', label: 'ignore case' },
  { key: 'm', label: 'multiline' },
  { key: 's', label: 'dotAll' },
  { key: 'u', label: 'unicode' },
  { key: 'y', label: 'sticky' },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState('(\\w+)@(\\w+)\\.(\\w+)');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState(
    'Contact us at support@example.com or info@web.org!'
  );
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<RegExpExecArray[]>([]);

  // Regex processing
  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setError(null);
      return;
    }
    try {
      const regex = new RegExp(pattern, flags);
      const allMatches = Array.from(testString.matchAll(regex));
      setMatches(allMatches);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setMatches([]);
    }
  }, [pattern, flags, testString]);

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      <PatternCard
        pattern={pattern}
        setPattern={setPattern}
        flags={flags}
        setFlags={setFlags}
        error={error}
      />

      <SectionGap />

      <TestCard
        pattern={pattern}
        flags={flags}
        matches={matches}
        testString={testString}
        setTestString={setTestString}
        error={error}
      />

      <SectionGap />

      <DetailCard matches={matches} />
    </>
  );
}
