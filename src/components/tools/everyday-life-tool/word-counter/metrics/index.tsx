'use client';

import {
  BarChart3,
  Binary,
  BookOpen,
  ChartColumn,
  Clock,
  FileText,
  Gauge,
  Globe,
  Hash,
  Languages,
  LetterText,
  MessageSquareText,
  Mic,
  Pilcrow,
  Search,
  Space,
  Type,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { InsetGroup } from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';
import { Tabs } from '@/components/ui/tabs';

import { computeTextStats, formatMinutesLabel } from '../utils/text-analysis';

import { KeywordDensity } from './keyword-density';
import { KpiTile } from './kpi-tile';
import MetricRow from './metric-row';
import { PlatformLimits } from './platform-limits';

type MetricsTab = 'overview' | 'limits' | 'keywords';

const METRICS_TABS: MetricsTab[] = ['overview', 'limits', 'keywords'];

const METRICS_TAB_LABELS: Record<MetricsTab, string> = {
  overview: 'Overview',
  limits: 'SEO & Limits',
  keywords: 'Keywords',
};

const METRICS_TAB_ICONS: Record<MetricsTab, typeof BarChart3> = {
  overview: BarChart3,
  limits: Gauge,
  keywords: Search,
};

type MetricsProps = {
  text: string;
};

export default function Metrics({ text }: MetricsProps) {
  const [activeTab, setActiveTab] = useState<MetricsTab>('overview');
  const stats = useMemo(() => computeTextStats(text), [text]);

  return (
    <div className="space-y-3 text-left">
      <LabelBar icon={ChartColumn} label="Live Analytics" />

      {/* 4-Tile KPI Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <KpiTile
          label="Words (EN + CJK)"
          value={stats.smartWords}
          subLabel={`${stats.englishWords} EN / ${stats.chineseChars} ZH`}
          icon={BookOpen}
        />
        <KpiTile
          label="Characters"
          value={stats.totalChars}
          subLabel={`${stats.charsNoSpaces} no spaces`}
          icon={FileText}
        />
        <KpiTile
          label="Sentences"
          value={stats.sentences}
          subLabel={`${stats.paragraphs} paragraphs`}
          icon={MessageSquareText}
        />
        <KpiTile
          label="Read Time"
          value={formatMinutesLabel(stats.readingMinutes)}
          subLabel={`Speak ~${formatMinutesLabel(stats.speakingMinutes)}`}
          icon={Clock}
        />
      </div>

      {/* Mode Switcher */}
      <Tabs<MetricsTab>
        tabs={METRICS_TABS}
        activeTab={activeTab}
        tabLabels={METRICS_TAB_LABELS}
        tabIcons={METRICS_TAB_ICONS}
        onChange={setActiveTab}
        size="xs"
        rounded="lg"
        variant="segment"
        fullWidth
      />

      {/* Tab Body */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <InsetGroup rounded="xl">
            <MetricRow
              label="Total Characters"
              value={stats.totalChars}
              icon={FileText}
            />
            <MetricRow
              label="Without Spaces"
              value={stats.charsNoSpaces}
              icon={Space}
            />
            <MetricRow
              label="English Words"
              value={stats.englishWords}
              icon={Type}
            />
            <MetricRow
              label="Chinese Characters"
              value={stats.chineseChars}
              icon={Languages}
            />
            <MetricRow label="Total Lines" value={stats.lines} icon={Pilcrow} />
          </InsetGroup>

          <InsetGroup rounded="xl">
            <MetricRow
              label="English Letters"
              value={stats.englishLetters}
              icon={LetterText}
            />
            <MetricRow
              label="English Punctuation"
              value={stats.englishPunc}
              icon={Hash}
            />
            <MetricRow
              label="Chinese Punctuation"
              value={stats.chinesePunc}
              icon={Hash}
            />
            <MetricRow label="Digits" value={stats.numbers} icon={Binary} />
            <MetricRow
              label="Speak Duration"
              value={formatMinutesLabel(stats.speakingMinutes)}
              icon={Mic}
            />
            <MetricRow
              label="Payload (UTF-8)"
              value={`${stats.bytes} B`}
              icon={Globe}
            />
          </InsetGroup>
        </div>
      )}

      {activeTab === 'limits' && (
        <PlatformLimits charCount={stats.totalChars} />
      )}

      {activeTab === 'keywords' && <KeywordDensity text={text} />}
    </div>
  );
}
