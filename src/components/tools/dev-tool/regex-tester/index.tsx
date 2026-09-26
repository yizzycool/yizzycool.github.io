'use client';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';

import CheatSheetSection from './cheat-sheet-section';
import DetailSection from './detail-section';
import PatternSection from './pattern-section';
import TestSection from './test-section';
import useRegexTester from './hooks/use-regex-tester';

export type RegexColorType = {
  bg: string;
  text: string;
  border: string;
};

export const RegexColors: Array<RegexColorType> = [
  {
    bg: 'bg-sky-500/20 dark:bg-sky-400/25',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/40 dark:border-sky-400/40',
  },
  {
    bg: 'bg-emerald-500/20 dark:bg-emerald-400/25',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/40 dark:border-emerald-400/40',
  },
  {
    bg: 'bg-indigo-500/20 dark:bg-indigo-400/25',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/40 dark:border-indigo-400/40',
  },
  {
    bg: 'bg-amber-500/20 dark:bg-amber-400/25',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/40 dark:border-amber-400/40',
  },
  {
    bg: 'bg-rose-500/20 dark:bg-rose-400/25',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/40 dark:border-rose-400/40',
  },
  {
    bg: 'bg-teal-500/20 dark:bg-teal-400/25',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/40 dark:border-teal-400/40',
  },
  {
    bg: 'bg-fuchsia-500/20 dark:bg-fuchsia-400/25',
    text: 'text-fuchsia-600 dark:text-fuchsia-400',
    border: 'border-fuchsia-500/40 dark:border-fuchsia-400/40',
  },
  {
    bg: 'bg-orange-500/20 dark:bg-orange-400/25',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/40 dark:border-orange-400/40',
  },
  {
    bg: 'bg-cyan-500/20 dark:bg-cyan-400/25',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/40 dark:border-cyan-400/40',
  },
  {
    bg: 'bg-lime-500/20 dark:bg-lime-400/25',
    text: 'text-lime-600 dark:text-lime-400',
    border: 'border-lime-500/40 dark:border-lime-400/40',
  },
];

export default function RegexTester() {
  const {
    pattern,
    setPattern,
    flags,
    setFlags,
    testString,
    setTestString,
    matches,
    error,
    selectedPresetId,
    patternInputRef,
    testTextareaRef,
    onSelectPreset,
    onPasteTestString,
    onClearTestString,
  } = useRegexTester();

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          TOOL_HOTKEYS.paste,
          { ...TOOL_HOTKEYS.copy, label: 'Copy Pattern' },
          { ...TOOL_HOTKEYS.clear, label: 'Clear Test String' },
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      {/* Pattern input + Presets + Visualizer */}
      <PatternSection
        pattern={pattern}
        setPattern={setPattern}
        flags={flags}
        setFlags={setFlags}
        error={error}
        patternInputRef={patternInputRef}
        selectedPresetId={selectedPresetId}
        onSelectPreset={onSelectPreset}
      />

      <SectionGap />

      {/* Test string textarea + Highlighting + Actions */}
      <TestSection
        pattern={pattern}
        flags={flags}
        matches={matches}
        testString={testString}
        setTestString={setTestString}
        error={error}
        testTextareaRef={testTextareaRef}
        onPaste={onPasteTestString}
        onClear={onClearTestString}
      />

      <SectionGap />

      {/* Match Details with Named Groups */}
      <DetailSection matches={matches} />

      <SectionGap />

      {/* Regex Cheat Sheet Reference Section */}
      <CheatSheetSection />
    </>
  );
}
