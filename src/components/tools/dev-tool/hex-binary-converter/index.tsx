'use client';

import type { ReactNode } from 'react';
import type { InputMode, HexBinaryHistoryData } from './types';

import { Wand2, Binary } from 'lucide-react';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import LabelBar from '@/components/tools/common/label-bar';
import ExecuteBar from '@/components/tools/common/execute-bar';
import { PillTabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  DeleteAction,
  PasteAction,
  SampleAction,
} from '@/components/shared/action-button';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import useHexBinaryConverter from './hooks/use-hex-binary-converter';
import ConversionResultsSection from './conversion-results-section';

const INPUT_MODES: InputMode[] = ['text', 'hex', 'binary', 'decimal'];

const INPUT_MODE_LABELS: Record<InputMode, ReactNode> = {
  text: 'UTF-8',
  hex: 'Hex',
  binary: 'Binary',
  decimal: 'Decimal',
};

const INPUT_PLACEHOLDERS: Record<InputMode, string> = {
  text: 'Enter plain text, code, or Unicode characters (e.g. Hello 🌍)...',
  hex: 'Enter Hexadecimal bytes (e.g. 48 65 6c 6c 6f or 0x48, 0x65)...',
  binary: 'Enter 0/1 binary bitstream (e.g. 01001000 01100101)...',
  decimal: 'Enter comma-separated decimal bytes 0-255 (e.g. 72, 101, 108)...',
};

export default function HexBinaryConverter() {
  const {
    input,
    inputMode,
    setInputMode,
    options,
    setOptions,
    result,
    inputRef,
    // History
    historyList,
    isLoadingHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    handleRestoreHistory,
    // Actions
    handleExecute,
    handleClear,
    handleLoadSample,
    handleInputChange,
    handlePaste,
  } = useHexBinaryConverter();

  return (
    <div>
      {/* Header Block with History Drawer & Hotkeys */}
      <HeaderBlock<HexBinaryHistoryData>
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={handleRestoreHistory}
        onRenameHistory={renameHistory}
        onRemoveHistory={removeHistory}
        onClearHistory={clearHistory}
        customShortcuts={[
          TOOL_HOTKEYS.process,
          TOOL_HOTKEYS.copy,
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.history,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      {/* Input Mode Selector */}
      <div className="flex items-center justify-between">
        <PillTabs<InputMode>
          tabs={INPUT_MODES}
          activeTab={inputMode}
          onChange={setInputMode}
          tabLabels={INPUT_MODE_LABELS}
          variant="segment"
          size="sm"
          rounded="lg"
        />
      </div>

      <SectionGap size="sm" />

      {/* Input Section */}
      <LabelBar
        label="Input Payload"
        icon={Binary}
        actions={
          <div className="flex items-center gap-2">
            <SampleAction
              rounded="lg"
              label="Sample"
              onClick={handleLoadSample}
            />
            <PasteAction rounded="lg" onClick={handlePaste} />
            <DeleteAction
              variant="ghost"
              bordered
              rounded="lg"
              label="Clear"
              onClick={handleClear}
            />
          </div>
        }
      />

      <Textarea
        ref={inputRef}
        value={input}
        onChange={handleInputChange}
        placeholder={INPUT_PLACEHOLDERS[inputMode]}
        rows={4}
        className="font-mono text-xs"
      />

      <ExecuteBar
        label="Convert"
        icon={Wand2}
        onClick={handleExecute}
        disabled={!input.trim()}
        text={input}
      />

      <SectionGap />

      {/* Multi-Format Inset Grouped Results Section */}
      <ConversionResultsSection
        result={result}
        options={options}
        onChangeOptions={setOptions}
      />
    </div>
  );
}
