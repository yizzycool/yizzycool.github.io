'use client';

import type { UnixTimestampHistoryData } from './hooks/use-unix-timestamp-converter';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import CurrentTimeCard from './current-time-card';
import TimestampToDateCard from './timestamp-to-date-card';
import DateToTimestampCard from './date-to-timestamp-card';
import ReferenceCard from './reference-card';
import useUnixTimestampConverter from './hooks/use-unix-timestamp-converter';

export default function UnixTimestampConverter() {
  const {
    // Live clock
    now,
    isClockPaused,
    toggleClockPause,
    deviceTimezone,

    // Timestamp -> Date
    tsInput,
    setTsInput,
    unitMode,
    setUnitMode,
    tsInputRef,
    parsedTimestampInfo,
    tsConvertedValues,
    applyOffset,
    setTsInputToNow,
    onPasteTsInput,
    onClearTsInput,

    // Date -> Timestamp
    dateFields,
    dateTzMode,
    setDateTzMode,
    convertedFromDate,
    updateDateField,
    setDateToNow,
    onClearDateInput,

    // History
    historyList,
    isLoadingHistory,
    saveToHistory,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useUnixTimestampConverter();

  return (
    <>
      <HeaderBlock<UnixTimestampHistoryData>
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={onRestoreHistory}
        onRenameHistory={renameHistory}
        onRemoveHistory={removeHistory}
        onClearHistory={clearHistory}
        customShortcuts={[
          { ...TOOL_HOTKEYS.process, label: 'Save Record to History' },
          TOOL_HOTKEYS.paste,
          { ...TOOL_HOTKEYS.copy, label: 'Copy Primary Result' },
          { ...TOOL_HOTKEYS.clear, label: 'Clear Input' },
          TOOL_HOTKEYS.history,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      {/* Live Device Time with Pause / Play Controls */}
      <CurrentTimeCard
        now={now}
        isPaused={isClockPaused}
        onTogglePause={toggleClockPause}
        deviceTimezone={deviceTimezone}
      />

      <SectionGap />

      {/* Timestamp to Date with Presets, Offsets, Relative Time & World Timezones */}
      <TimestampToDateCard
        tsInput={tsInput}
        setTsInput={setTsInput}
        unitMode={unitMode}
        setUnitMode={setUnitMode}
        inputRef={tsInputRef}
        parsedInfo={parsedTimestampInfo}
        convertedValues={tsConvertedValues}
        onSetToNow={setTsInputToNow}
        onApplyOffset={applyOffset}
        onPaste={onPasteTsInput}
        onClear={onClearTsInput}
        onSaveHistory={() => saveToHistory('timestamp-to-date')}
      />

      <SectionGap />

      {/* Date to Timestamp with Timezone Toggle & Quick Jump Presets */}
      <DateToTimestampCard
        dateFields={dateFields}
        timezoneMode={dateTzMode}
        setTimezoneMode={setDateTzMode}
        convertedResult={convertedFromDate}
        onUpdateField={updateDateField}
        onSetToNow={setDateToNow}
        onClear={onClearDateInput}
        onSaveHistory={() => saveToHistory('date-to-timestamp')}
      />

      <SectionGap />

      {/* Common Timestamp Intervals Cheat Sheet */}
      <ReferenceCard />
    </>
  );
}
