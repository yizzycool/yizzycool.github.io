'use client';

import { useState, useMemo, useCallback, useRef } from 'react';

import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import { REGEX_PRESETS, CUSTOM_PRESET_ID } from '../constants';

const DEFAULT_PATTERN = '([A-Z])\\w+';
const DEFAULT_FLAGS = 'g';
const DEFAULT_TEST_STRING = 'Regular Expression';

export default function useRegexTester() {
  const [pattern, setPatternState] = useState(DEFAULT_PATTERN);
  const [flags, setFlagsState] = useState(DEFAULT_FLAGS);
  const [testString, setTestString] = useState(DEFAULT_TEST_STRING);
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>(CUSTOM_PRESET_ID);

  const patternInputRef = useRef<HTMLInputElement>(null);
  const testTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute matches & error
  const { matches, error } = useMemo(() => {
    if (!pattern) {
      return { matches: [], error: null };
    }
    try {
      const regex = new RegExp(pattern, flags + 'd');
      const allMatches = Array.from(testString.matchAll(regex));
      return { matches: allMatches, error: null };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [pattern, flags, testString]);

  // Wrapped setPattern that updates preset status to custom if modified
  const setPattern = useCallback(
    (actionOrValue: React.SetStateAction<string>) => {
      setPatternState((prev) => {
        const next =
          typeof actionOrValue === 'function'
            ? actionOrValue(prev)
            : actionOrValue;
        const matched = REGEX_PRESETS.find(
          (p) => p.pattern === next && p.flags === flags
        );
        setSelectedPresetId(matched ? matched.id : CUSTOM_PRESET_ID);
        return next;
      });
    },
    [flags]
  );

  // Wrapped setFlags that updates preset status to custom if modified
  const setFlags = useCallback(
    (actionOrValue: React.SetStateAction<string>) => {
      setFlagsState((prev) => {
        const next =
          typeof actionOrValue === 'function'
            ? actionOrValue(prev)
            : actionOrValue;
        const matched = REGEX_PRESETS.find(
          (p) => p.pattern === pattern && p.flags === next
        );
        setSelectedPresetId(matched ? matched.id : CUSTOM_PRESET_ID);
        return next;
      });
    },
    [pattern]
  );

  // Preset Selection
  const onSelectPreset = useCallback(
    (presetId: string) => {
      if (presetId === CUSTOM_PRESET_ID) {
        setSelectedPresetId(CUSTOM_PRESET_ID);
        toast.info('Switched to Custom Pattern');
        return;
      }

      const preset = REGEX_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      setSelectedPresetId(preset.id);
      setPatternState(preset.pattern);
      setFlagsState(preset.flags);

      // Smart test string overwrite:
      // Only replace test string if it's empty, matches DEFAULT_TEST_STRING,
      // or matches another preset's sampleText.
      const isUserCustomText =
        testString.trim() !== '' &&
        testString !== DEFAULT_TEST_STRING &&
        !REGEX_PRESETS.some((p) => p.sampleText === testString);

      if (!isUserCustomText) {
        setTestString(preset.sampleText);
        toast.info(`Loaded preset: ${preset.name}`);
      } else {
        toast.info(
          `Loaded preset: ${preset.name} (preserved your test string)`
        );
      }
    },
    [testString]
  );

  // Paste text into test string
  const onPasteTestString = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.warning('Clipboard is empty');
        return;
      }
      setTestString(text);
      toast.success('Pasted clipboard text');
      testTextareaRef.current?.focus();
    } catch {
      toast.error('Failed to read from clipboard');
    }
  }, []);

  // Clear test string
  const onClearTestString = useCallback(() => {
    setTestString('');
    toast.info('Test string cleared');
    testTextareaRef.current?.focus();
  }, []);

  // Copy pattern
  const onCopyPattern = useCallback(async () => {
    if (!pattern) return;
    try {
      await navigator.clipboard.writeText(`/${pattern}/${flags}`);
      toast.success('Copied regex to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [pattern, flags]);

  // Keyboard Shortcuts Hook
  useToolHotkeys(
    {
      onCopy: onCopyPattern,
      onPaste: onPasteTestString,
      onClear: onClearTestString,
    },
    {
      target: testTextareaRef,
    }
  );

  return {
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
    // Actions
    onSelectPreset,
    onPasteTestString,
    onClearTestString,
    onCopyPattern,
  };
}
