'use client';

import type { HotkeyItem } from '@/components/ui/badge';
import type { MilestoneState, PosterTheme, SavedMilestone } from '../types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { useLocalStorage } from '@/hooks/window/use-local-storage';
import toast from '@/utils/toast';

import {
  DAYS_MATTER_SAVED_STORAGE_KEY,
  DEFAULT_MILESTONE_STATE,
  MAX_NOTE_LENGTH,
  MAX_TITLE_LENGTH,
  POSTER_THEMES,
  SAMPLE_MILESTONE_STATE,
} from '../constants';
import {
  buildShareUrl,
  computeCountdown,
  getNextNewYearDateValue,
  parseShareParams,
  sanitizeUserText,
} from '../utils/date-math';
import { copyPosterPng, downloadPosterPng } from '../utils/poster-exporter';

/**
 * Manages milestone state, live countdown ticks, URL sharing, saved presets, and PNG poster exports.
 */
export function useDaysMatter(suppressHotkeys = false) {
  const [state, setState] = useState<MilestoneState>(DEFAULT_MILESTONE_STATE);
  const [nowMs, setNowMs] = useState<number>(0);
  const [isCopyingImage, setIsCopyingImage] = useState(false);

  const {
    value: savedMilestones,
    setValue: setSavedMilestones,
    removeValue: clearSavedStorage,
  } = useLocalStorage<SavedMilestone[]>(DAYS_MATTER_SAVED_STORAGE_KEY, []);

  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const parsedSharedRef = useRef<Partial<MilestoneState> | null | undefined>(
    undefined
  );

  // Hydrate default next-year Jan 1 / URL parameters (stripping share query params immediately) and start 1-second live clock after mount
  useEffect(() => {
    if (parsedSharedRef.current === undefined) {
      const parsed = parseShareParams(window.location.search);
      parsedSharedRef.current = parsed;
      if (parsed) {
        const cleanUrl = new URL(window.location.href);
        ['title', 'date', 'theme', 'ratio', 'note'].forEach((key) =>
          cleanUrl.searchParams.delete(key)
        );
        window.history.replaceState(
          window.history.state,
          '',
          `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`
        );
      }
    }

    const shared = parsedSharedRef.current;
    const defaultDate = getNextNewYearDateValue();
    queueMicrotask(() => {
      setState((prev) => ({
        ...prev,
        date: shared?.date ?? defaultDate,
        ...shared,
      }));
      setNowMs(Date.now());
    });

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const theme = useMemo<PosterTheme>(
    () =>
      POSTER_THEMES.find((item) => item.id === state.themeId) ??
      POSTER_THEMES[0],
    [state.themeId]
  );

  const isClientClockReady = nowMs > 0;
  const breakdown = useMemo(
    () =>
      computeCountdown(
        state.date,
        isClientClockReady ? nowMs : new Date('2026-11-26T00:00:00').getTime()
      ),
    [isClientClockReady, nowMs, state.date]
  );

  const updateState = useCallback((patch: Partial<MilestoneState>) => {
    setState((prev) => ({
      ...prev,
      ...patch,
      ...(patch.title !== undefined
        ? { title: sanitizeUserText(patch.title, MAX_TITLE_LENGTH) }
        : {}),
      ...(patch.note !== undefined
        ? { note: sanitizeUserText(patch.note, MAX_NOTE_LENGTH) }
        : {}),
    }));
  }, []);

  const handleLoadSample = useCallback(() => {
    setState({
      ...SAMPLE_MILESTONE_STATE,
      date: `${new Date().getFullYear() + 1}-04-01`,
    });
  }, []);

  const handleReset = useCallback(() => {
    setState({
      ...DEFAULT_MILESTONE_STATE,
      date: getNextNewYearDateValue(),
    });
    toast.info('Milestone reset to default');
  }, []);

  const handleCopyShareLink = useCallback(async () => {
    const url = buildShareUrl(state);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Shareable link copied to clipboard');
    } catch {
      toast.error('Clipboard permission denied');
    }
  }, [state]);

  const handleDownloadPng = useCallback(() => {
    if (!breakdown.isValid) {
      toast.info('Select a valid target date first');
      return;
    }
    try {
      downloadPosterPng(state, theme, breakdown);
      toast.success('Countdown poster PNG downloaded');
    } catch {
      toast.error('Failed to export poster PNG');
    }
  }, [breakdown, state, theme]);

  const handleCopyPng = useCallback(async () => {
    if (!breakdown.isValid) {
      toast.info('Select a valid target date first');
      return;
    }
    setIsCopyingImage(true);
    try {
      await copyPosterPng(state, theme, breakdown);
      toast.success('Poster image copied to clipboard');
    } catch {
      toast.error('Failed to copy image to clipboard');
    } finally {
      setIsCopyingImage(false);
    }
  }, [breakdown, state, theme]);

  const handleSaveMilestone = useCallback(() => {
    if (!breakdown.isValid) {
      toast.info('Enter a valid target date before saving');
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: SavedMilestone = {
      id,
      title: state.title.trim() || 'Special Milestone',
      date: state.date,
      note: state.note.trim(),
      themeId: state.themeId,
      ratio: state.ratio,
    };
    setSavedMilestones([entry, ...savedMilestones].slice(0, 20));
    toast.success('Milestone saved to browser storage');
  }, [
    breakdown.isValid,
    savedMilestones,
    setSavedMilestones,
    state.date,
    state.note,
    state.ratio,
    state.themeId,
    state.title,
  ]);

  const handleLoadSavedMilestone = useCallback((item: SavedMilestone) => {
    setState((prev) => ({
      ...prev,
      title: item.title,
      date: item.date,
      note: item.note,
      themeId: item.themeId,
      ratio: item.ratio,
    }));
    toast.info(`Loaded "${item.title}"`);
  }, []);

  const handleDeleteSavedMilestone = useCallback(
    (id: string) => {
      setSavedMilestones(savedMilestones.filter((item) => item.id !== id));
      toast.info('Milestone removed');
    },
    [savedMilestones, setSavedMilestones]
  );

  const handleClearAllSaved = useCallback(() => {
    clearSavedStorage();
    toast.info('All saved milestones cleared');
  }, [clearSavedStorage]);

  useToolHotkeys(
    {
      onSave: handleDownloadPng,
      onCopy: handleCopyShareLink,
      onClear: handleReset,
    },
    { target: titleInputRef, enabled: !suppressHotkeys }
  );

  const customShortcuts = useMemo<HotkeyItem[]>(
    () => [
      { ...TOOL_HOTKEYS.save, label: 'Download Poster PNG' },
      { ...TOOL_HOTKEYS.copy, label: 'Copy Share URL' },
      { ...TOOL_HOTKEYS.clear, label: 'Reset Form' },
      TOOL_HOTKEYS.help,
    ],
    []
  );

  return {
    state,
    theme,
    nowMs,
    breakdown,
    isClientClockReady,
    isCopyingImage,
    savedMilestones,
    titleInputRef,
    customShortcuts,
    updateState,
    handleLoadSample,
    handleReset,
    handleCopyShareLink,
    handleDownloadPng,
    handleCopyPng,
    handleSaveMilestone,
    handleLoadSavedMilestone,
    handleDeleteSavedMilestone,
    handleClearAllSaved,
  };
}
