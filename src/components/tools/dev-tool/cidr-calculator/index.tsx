'use client';

import { Network } from 'lucide-react';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import LabelBar from '@/components/tools/common/label-bar';
import ExecuteBar from '@/components/tools/common/execute-bar';
import { Input } from '@/components/ui/input';
import {
  DeleteAction,
  PasteAction,
  SampleAction,
} from '@/components/shared/action-button';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import useCidrCalculator from './hooks/use-cidr-calculator';
import CidrResultsSection from './cidr-results-section';
import SubnetSplitSection from './subnet-split-section';
import type { CidrHistoryData } from './types';

export default function CidrCalculator() {
  const {
    input,
    result,
    splitPrefix,
    setSplitPrefix,
    splitResults,
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
  } = useCidrCalculator();

  return (
    <div>
      {/* Header Block with History Drawer & Shortcuts */}
      <HeaderBlock<CidrHistoryData>
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

      {/* Input Section */}
      <LabelBar
        label="IP Address & Mask"
        icon={Network}
        actions={
          <div className="flex items-center gap-1">
            <SampleAction onClick={handleLoadSample} />
            <PasteAction onClick={handlePaste} />
            <DeleteAction onClick={handleClear} />
          </div>
        }
      />

      <Input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Enter IPv4 CIDR (e.g. 192.168.1.0/24 or 10.0.0.1 255.255.0.0)..."
      />

      {/* Action / Execute Bar */}
      <ExecuteBar
        label="Calculate Subnet"
        onClick={handleExecute}
        showCharCount={false}
        disabled={!input.trim()}
      />

      <SectionGap />

      {/* 11 Properties Results Section (Includes 32-bit binary row directly under CIDR) */}
      <CidrResultsSection result={result} />

      <SectionGap />

      {/* Subnet Split / VLSM Breakdown */}
      <SubnetSplitSection
        result={result}
        splitPrefix={splitPrefix}
        splitResults={splitResults}
        onChangeSplitPrefix={setSplitPrefix}
      />
    </div>
  );
}
