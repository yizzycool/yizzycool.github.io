'use client';

import { useState } from 'react';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';

import useRegexTester from './hooks/use-regex-tester';
import PatternSection from './pattern-section';
import TestSection from './test-section';
import WorkbenchInspector from './workbench-inspector';

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
  const [hoveredMatchIndex, setHoveredMatchIndex] = useState<number | null>(
    null
  );

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

  const handleInsertToken = (token: string) => {
    const inputEl = patternInputRef.current;
    if (!inputEl) {
      setPattern((prev) => `${prev}${token}`);
      return;
    }

    const start = inputEl.selectionStart ?? pattern.length;
    const end = inputEl.selectionEnd ?? pattern.length;
    const nextPattern = `${pattern.slice(0, start)}${token}${pattern.slice(end)}`;
    setPattern(nextPattern);

    requestAnimationFrame(() => {
      inputEl.focus();
      const cursor = start + token.length;
      inputEl.setSelectionRange(cursor, cursor);
    });
  };

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

      <SectionGap size="sm" />

      {/* Top RegExr-Style Command Bar */}
      <PatternSection
        pattern={pattern}
        flags={flags}
        matchCount={matches.length}
        setPattern={setPattern}
        setFlags={setFlags}
        error={error}
        patternInputRef={patternInputRef}
        selectedPresetId={selectedPresetId}
        onSelectPreset={onSelectPreset}
      />

      <SectionGap size="sm" />

      {/* Desktop 7:5 IDE Split Workbench */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <TestSection
            pattern={pattern}
            flags={flags}
            matches={matches}
            testString={testString}
            setTestString={setTestString}
            error={error}
            hoveredMatchIndex={hoveredMatchIndex}
            testTextareaRef={testTextareaRef}
            onPaste={onPasteTestString}
            onClear={onClearTestString}
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <WorkbenchInspector
            matches={matches}
            hoveredMatchIndex={hoveredMatchIndex}
            onHoverMatch={setHoveredMatchIndex}
            selectedPresetId={selectedPresetId}
            onSelectPreset={onSelectPreset}
            onInsertToken={handleInsertToken}
          />
        </div>
      </div>
    </>
  );
}
