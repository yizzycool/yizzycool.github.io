'use client';

import {
  Binary,
  ChartColumn,
  FileText,
  Globe,
  Hash,
  Languages,
  LetterText,
  Pilcrow,
  Type,
} from 'lucide-react';
import { useMemo } from 'react';
import Card from '@/components/common/card';
import MetricRow from './components/metric-row';
import CardTitle from '@/components/common/card/title';

type Props = {
  text: string;
};

export default function Metrics({ text }: Props) {
  const stats = useMemo(() => {
    if (!text) {
      return {
        totalChars: 0,
        lines: 0,
        numbers: 0,
        chineseChars: 0,
        chinesePunc: 0,
        englishLetters: 0,
        englishPunc: 0,
        englishWords: 0,
        bytes: 0,
      };
    }

    const chineseRegex = /[\u4e00-\u9fa5]/g;
    const chinesePuncRegex =
      /[\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/g;
    const englishLetterRegex = /[a-zA-Z]/g;
    const englishPuncRegex = /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g;
    const numberRegex = /\d/g;
    const englishWordRegex = /[a-zA-Z0-9']+/g;

    const chineseChars = (text.match(chineseRegex) || []).length;
    const chinesePunc = (text.match(chinesePuncRegex) || []).length;
    const englishLetters = (text.match(englishLetterRegex) || []).length;
    const englishPunc = (text.match(englishPuncRegex) || []).length;
    const numbers = (text.match(numberRegex) || []).length;
    const englishWords = (text.match(englishWordRegex) || []).length;

    const lines = text.trim() === '' ? 0 : text.split('\n').length;
    const totalChars = text.length;
    const bytes = new TextEncoder().encode(text).length;

    return {
      totalChars,
      lines,
      numbers,
      chineseChars,
      chinesePunc,
      englishLetters,
      englishPunc,
      englishWords,
      bytes,
    };
  }, [text]);

  return (
    <Card>
      <CardTitle icon={ChartColumn}>Detailed Metrics</CardTitle>

      {/* Separate */}
      <div className="-mx-6 my-6 border-b border-neutral-200 dark:border-neutral-700" />

      {/* Metrics */}
      {/* Core Items */}
      <MetricRow
        label="Total Characters"
        value={stats.totalChars}
        icon={FileText}
      />
      <MetricRow label="English Words" value={stats.englishWords} icon={Type} />
      <MetricRow
        label="Chinese Characters"
        value={stats.chineseChars}
        icon={Languages}
      />
      <MetricRow label="Total Lines" value={stats.lines} icon={Pilcrow} />

      <div className="px-4 py-2">
        <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800" />
      </div>

      {/* Secondary Items */}
      <MetricRow
        label="English Letters"
        value={stats.englishLetters}
        icon={LetterText}
      />
      <MetricRow label="English Punc." value={stats.englishPunc} icon={Hash} />
      <MetricRow label="Chinese Punc." value={stats.chinesePunc} icon={Hash} />
      <MetricRow label="Numbers" value={stats.numbers} icon={Binary} />
      <MetricRow
        label="Bytes (UTF-8)"
        value={`${stats.bytes} B`}
        icon={Globe}
      />
    </Card>
  );
}
