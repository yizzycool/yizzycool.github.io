'use client';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import CurrentTimeSection from './current-time-section';
import DateToTimestampSection from './date-to-timestamp-section';
import ReferenceSection from './reference-section';
import TimestampToDateSection from './timestamp-to-date-section';
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

      {/* Live Device Time with Pause / Play Controls */}
      <CurrentTimeSection
        now={now}
        isPaused={isClockPaused}
        onTogglePause={toggleClockPause}
        deviceTimezone={deviceTimezone}
      />

      <SectionGap />

      {/* Timestamp to Date with Presets, Offsets, Relative Time & World Timezones */}
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

      <SectionGap />

      {/* Date to Timestamp with Timezone Toggle & Quick Jump Presets */}
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

      <SectionGap />

      {/* Common Timestamp Intervals Cheat Sheet */}
      <ReferenceSection />
    </>
  );
}
