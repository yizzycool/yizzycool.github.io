'use client';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import CurrentTimeSection from './current-time-section';
import DateToTimestampSection from './date-to-timestamp-section';
import ReferenceSection from './reference-section';
import TimestampToDateSection from './timestamp-to-date-section';
import WorldClockStrip from './world-clock-strip';
import useUnixTimestampConverter from './hooks/use-unix-timestamp-converter';

export default function UnixTimestampConverter() {
  const {
    now,
    isClockPaused,
    toggleClockPause,
    deviceTimezone,

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

    dateTimeString,
    dateTzMode,
    setDateTzMode,
    convertedFromDate,
    onDateTimeChange,
    onApplyDateOffset,
    onPasteDateString,
    setDateToNow,
    onClearDateInput,
  } = useUnixTimestampConverter();

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          TOOL_HOTKEYS.paste,
          { ...TOOL_HOTKEYS.copy, label: 'Copy Primary Result' },
          { ...TOOL_HOTKEYS.clear, label: 'Clear Input' },
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      {/* Live Epoch Clock Hero with Stopwatch Pause/Resume */}
      <CurrentTimeSection
        now={now}
        isPaused={isClockPaused}
        onTogglePause={toggleClockPause}
        deviceTimezone={deviceTimezone}
      />

      <SectionGap />

      {/* 50/50 Bidirectional Conversion Cards */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="rounded-2xl border border-neutral-200/80 bg-white/60 p-5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
          <TimestampToDateSection
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
          />
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white/60 p-5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
          <DateToTimestampSection
            dateTimeString={dateTimeString}
            timezoneMode={dateTzMode}
            setTimezoneMode={setDateTzMode}
            convertedResult={convertedFromDate}
            onDateTimeChange={onDateTimeChange}
            onApplyOffset={onApplyDateOffset}
            onPasteDateString={onPasteDateString}
            onSetToNow={setDateToNow}
            onClear={onClearDateInput}
          />
        </div>
      </div>

      <SectionGap />

      {/* World Clock Quick Strip */}
      <WorldClockStrip now={now} deviceTimezone={deviceTimezone} />

      <SectionGap />

      {/* Common Timestamp Intervals Cheat Sheet */}
      <ReferenceSection />
    </>
  );
}
