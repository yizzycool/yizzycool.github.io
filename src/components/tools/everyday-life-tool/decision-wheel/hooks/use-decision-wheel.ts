'use client';

import type { HotkeyItem } from '@/components/ui/badge';
import type {
  DecisionWheelPrefs,
  SpinRecord,
  SpinSpeed,
  WheelEntry,
  WheelPaletteId,
} from '../types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useToolHotkeys, {
  hasOpenModalDialog,
  TOOL_HOTKEYS,
} from '@/hooks/tools/use-tool-hotkeys';
import { useLocalStorage } from '@/hooks/window/use-local-storage';
import toast from '@/utils/toast';

import {
  DECISION_WHEEL_PREFS_STORAGE_KEY,
  DECISION_WHEEL_STORAGE_KEY,
  DEFAULT_PREFS,
  getPaletteColors,
  INITIAL_ENTRIES,
  MAX_ENTRIES,
  MAX_HISTORY_RECORDS,
  SPIN_DURATION_MS,
  SPIN_EXTRA_ROTATIONS,
  WHEEL_PRESETS,
} from '../constants';
import { playWheelTick, playWinChime } from '../utils/sound-effects';
import {
  areActiveWeightsEqual,
  buildWeightedSlices,
  clampPercent,
  createEntry,
  distributeEqualPercentages,
  getSecureRandomUnit,
  getSliceAtPointer,
  normalizeEntriesTo100,
  normalizeEntryLabel,
  parseBulkLines,
  roundToOneDecimal,
} from '../utils/wheel-math';

const TWO_PI = Math.PI * 2;

/**
 * Manages Decision Wheel entries, custom percentage shares, weighted slice math,
 * 60 FPS physical spin animation, Web Audio ticks, and keyboard shortcuts.
 */
export function useDecisionWheel(suppressHotkeys = false) {
  const { value: storedEntries, setValue: setStoredEntries } = useLocalStorage<
    WheelEntry[]
  >(DECISION_WHEEL_STORAGE_KEY, INITIAL_ENTRIES);

  const { value: storedPrefs, setValue: setStoredPrefs } =
    useLocalStorage<DecisionWheelPrefs>(
      DECISION_WHEEL_PREFS_STORAGE_KEY,
      DEFAULT_PREFS
    );

  const entries = Array.isArray(storedEntries)
    ? storedEntries
    : INITIAL_ENTRIES;
  const prefs = storedPrefs ?? DEFAULT_PREFS;

  const [history, setHistory] = useState<SpinRecord[]>([]);
  const [rotationRad, setRotationRad] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [pointerDeflection, setPointerDeflection] = useState<number>(0);
  const [winnerModalRecord, setWinnerModalRecord] = useState<SpinRecord | null>(
    null
  );

  const addInputRef = useRef<HTMLInputElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pointerTimerRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);
  const isSpinningRef = useRef<boolean>(false);
  const entriesRef = useRef<WheelEntry[]>(entries);
  const prefsRef = useRef<DecisionWheelPrefs>(prefs);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  const activeEntries = useMemo(
    () => entries.filter((entry) => !entry.eliminated),
    [entries]
  );

  const eliminatedEntries = useMemo(
    () => entries.filter((entry) => Boolean(entry.eliminated)),
    [entries]
  );

  const totalActivePercent = useMemo(
    () =>
      roundToOneDecimal(
        activeEntries.reduce((sum, item) => sum + clampPercent(item.weight), 0)
      ),
    [activeEntries]
  );

  const slices = useMemo(() => buildWeightedSlices(entries), [entries]);

  const cancelAnimation = useCallback(() => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (pointerTimerRef.current !== null) {
      window.clearTimeout(pointerTimerRef.current);
      pointerTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  const triggerPointerBump = useCallback(() => {
    setPointerDeflection(-24);
    if (pointerTimerRef.current !== null) {
      window.clearTimeout(pointerTimerRef.current);
    }
    pointerTimerRef.current = window.setTimeout(() => {
      setPointerDeflection(0);
      pointerTimerRef.current = null;
    }, 65);
  }, []);

  const spin = useCallback(() => {
    if (isSpinningRef.current) return;

    const currentSlices = buildWeightedSlices(entriesRef.current);
    if (currentSlices.length < 2) {
      toast.info('Need at least 2 active options above 0% to spin');
      return;
    }

    cancelAnimation();
    setWinnerModalRecord(null);
    isSpinningRef.current = true;
    setIsSpinning(true);

    const activePrefs = prefsRef.current;
    const startRot = rotationRef.current;
    const durationMs = SPIN_DURATION_MS[activePrefs.spinSpeed];
    const baseRotations = SPIN_EXTRA_ROTATIONS[activePrefs.spinSpeed];
    const extraOffset = Math.floor(getSecureRandomUnit() * 3) + baseRotations;
    const randomFraction = getSecureRandomUnit();
    const targetRot = startRot + (extraOffset + randomFraction) * TWO_PI;

    const startTime = performance.now();
    let lastSliceId = getSliceAtPointer(startRot, currentSlices)?.entry.id;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 4.2);
      const currentRot = startRot + (targetRot - startRot) * eased;

      rotationRef.current = currentRot;
      setRotationRad(currentRot);

      const currentSlice = getSliceAtPointer(currentRot, currentSlices);
      if (currentSlice && currentSlice.entry.id !== lastSliceId) {
        lastSliceId = currentSlice.entry.id;
        triggerPointerBump();
        if (prefsRef.current.soundEnabled) {
          playWheelTick(1 - progress);
        }
      }

      if (progress < 1) {
        rafIdRef.current = window.requestAnimationFrame(step);
        return;
      }

      rafIdRef.current = null;
      isSpinningRef.current = false;
      setIsSpinning(false);
      setPointerDeflection(0);

      const normalizedEnd = currentRot % TWO_PI;
      rotationRef.current = normalizedEnd;
      setRotationRad(normalizedEnd);

      const winningSlice = getSliceAtPointer(normalizedEnd, currentSlices);
      if (!winningSlice) return;

      if (prefsRef.current.soundEnabled) {
        playWinChime();
      }

      const record: SpinRecord = {
        id: `spin-${Date.now()}-${Math.floor(getSecureRandomUnit() * 1e5)}`,
        entryId: winningSlice.entry.id,
        label: winningSlice.entry.label,
        color: winningSlice.entry.color,
        oddsPercent: Math.round(winningSlice.probability * 1000) / 10,
        timestamp: Date.now(),
      };

      setHistory((prev) => [record, ...prev].slice(0, MAX_HISTORY_RECORDS));
      if (prefsRef.current.showWinnerModal ?? true) {
        setWinnerModalRecord(record);
      } else {
        toast.success(`Winner: ${winningSlice.entry.label}`);
      }

      if (prefsRef.current.eliminateOnWin) {
        setStoredEntries(
          entriesRef.current.map((item) =>
            item.id === winningSlice.entry.id
              ? { ...item, eliminated: true }
              : item
          )
        );
      }
    };

    rafIdRef.current = window.requestAnimationFrame(step);
  }, [cancelAnimation, setStoredEntries, triggerPointerBump]);

  const addEntry = useCallback(
    (rawLabel: string): boolean => {
      if (isSpinningRef.current) return false;
      const clean = normalizeEntryLabel(rawLabel);
      if (!clean) return false;
      if (entries.length >= MAX_ENTRIES) {
        toast.info(`Maximum of ${MAX_ENTRIES} entries reached`);
        return false;
      }

      const paletteColors = getPaletteColors(
        prefs.paletteId ?? DEFAULT_PREFS.paletteId
      );
      const wasEqual = areActiveWeightsEqual(entries);
      const remaining = roundToOneDecimal(100 - totalActivePercent);
      const initialPercent = remaining >= 1 ? remaining : 10;

      const nextEntry = createEntry(
        clean,
        entries.length,
        initialPercent,
        paletteColors
      );
      const combined = [...entries, nextEntry];

      if (wasEqual) {
        const activeCount = combined.filter((item) => !item.eliminated).length;
        const equalShares = distributeEqualPercentages(activeCount);
        let idx = 0;
        setStoredEntries(
          combined.map((item) =>
            item.eliminated ? item : { ...item, weight: equalShares[idx++] }
          )
        );
      } else {
        setStoredEntries(combined);
      }
      return true;
    },
    [entries, prefs.paletteId, setStoredEntries, totalActivePercent]
  );

  const updateEntryLabel = useCallback(
    (id: string, nextLabel: string) => {
      if (isSpinningRef.current) return;
      const clean = nextLabel.slice(0, 48);
      setStoredEntries(
        entries.map((item) =>
          item.id === id ? { ...item, label: clean } : item
        )
      );
    },
    [entries, setStoredEntries]
  );

  const updateEntryPercent = useCallback(
    (id: string, percent: number) => {
      if (isSpinningRef.current) return;
      const clamped = clampPercent(percent);
      setStoredEntries(
        entries.map((item) =>
          item.id === id ? { ...item, weight: clamped } : item
        )
      );
    },
    [entries, setStoredEntries]
  );

  const equalizePercentages = useCallback(() => {
    if (isSpinningRef.current || activeEntries.length === 0) return;
    const equalShares = distributeEqualPercentages(activeEntries.length);
    let idx = 0;
    setStoredEntries(
      entries.map((item) =>
        item.eliminated ? item : { ...item, weight: equalShares[idx++] }
      )
    );
    toast.info('Distributed 100% evenly across active options');
  }, [activeEntries.length, entries, setStoredEntries]);

  const normalizePercentages = useCallback(() => {
    if (isSpinningRef.current || activeEntries.length === 0) return;
    setStoredEntries(normalizeEntriesTo100(entries));
    toast.success('Normalized active options to 100%');
  }, [activeEntries.length, entries, setStoredEntries]);

  const cycleEntryColor = useCallback(
    (id: string) => {
      if (isSpinningRef.current) return;
      const paletteColors = getPaletteColors(
        prefs.paletteId ?? DEFAULT_PREFS.paletteId
      );
      setStoredEntries(
        entries.map((item) => {
          if (item.id !== id) return item;
          const idx = paletteColors.indexOf(item.color);
          const nextColor = paletteColors[(idx + 1) % paletteColors.length];
          return { ...item, color: nextColor };
        })
      );
    },
    [entries, prefs.paletteId, setStoredEntries]
  );

  const removeEntry = useCallback(
    (id: string) => {
      if (isSpinningRef.current) return;
      const wasEqual = areActiveWeightsEqual(entries);
      const next = entries.filter((item) => item.id !== id);
      if (wasEqual) {
        const remainingActive = next.filter((item) => !item.eliminated).length;
        const equalShares = distributeEqualPercentages(remainingActive);
        let idx = 0;
        setStoredEntries(
          next.map((item) =>
            item.eliminated ? item : { ...item, weight: equalShares[idx++] }
          )
        );
      } else {
        setStoredEntries(next);
      }
    },
    [entries, setStoredEntries]
  );

  const applyBulkText = useCallback(
    (rawText: string) => {
      if (isSpinningRef.current) return;
      const lines = parseBulkLines(rawText, MAX_ENTRIES);
      const paletteColors = getPaletteColors(
        prefs.paletteId ?? DEFAULT_PREFS.paletteId
      );
      const equalShares = distributeEqualPercentages(lines.length);
      const nextEntries = lines.map((label, idx) =>
        createEntry(label, idx, equalShares[idx], paletteColors)
      );
      setStoredEntries(nextEntries);
      toast.success(`Updated wheel with ${nextEntries.length} options`);
    },
    [prefs.paletteId, setStoredEntries]
  );

  const loadPreset = useCallback(
    (presetId: string) => {
      if (isSpinningRef.current) return;
      const preset = WHEEL_PRESETS.find((item) => item.id === presetId);
      if (!preset) return;
      const paletteColors = getPaletteColors(
        prefs.paletteId ?? DEFAULT_PREFS.paletteId
      );
      const equalShares = distributeEqualPercentages(preset.items.length);
      const nextEntries = preset.items.map((label, idx) =>
        createEntry(label, idx, equalShares[idx], paletteColors)
      );
      setStoredEntries(nextEntries);
      toast.info(`Loaded "${preset.label}" preset`);
    },
    [prefs.paletteId, setStoredEntries]
  );

  const shuffleEntries = useCallback(() => {
    if (isSpinningRef.current || entries.length < 2) return;
    const copy = [...entries];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(getSecureRandomUnit() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setStoredEntries(copy);
    toast.info('Wheel options shuffled');
  }, [entries, setStoredEntries]);

  const sortEntries = useCallback(() => {
    if (isSpinningRef.current || entries.length < 2) return;
    const sorted = [...entries].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
    );
    setStoredEntries(sorted);
    toast.info('Sorted options A–Z');
  }, [entries, setStoredEntries]);

  const restoreEliminated = useCallback(() => {
    if (isSpinningRef.current) return;
    setStoredEntries(entries.map((item) => ({ ...item, eliminated: false })));
    toast.success('All eliminated options restored');
  }, [entries, setStoredEntries]);

  const eliminateEntryById = useCallback(
    (id: string) => {
      setStoredEntries(
        entriesRef.current.map((item) =>
          item.id === id ? { ...item, eliminated: true } : item
        )
      );
      setWinnerModalRecord(null);
    },
    [setStoredEntries]
  );

  const clearAllEntries = useCallback(() => {
    if (isSpinningRef.current) return;
    setStoredEntries([]);
    setWinnerModalRecord(null);
    toast.info('All wheel entries cleared');
  }, [setStoredEntries]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    toast.info('Spin history cleared');
  }, []);

  const updatePrefs = useCallback(
    (patch: Partial<DecisionWheelPrefs>) => {
      setStoredPrefs({
        ...prefs,
        ...patch,
      });
    },
    [prefs, setStoredPrefs]
  );

  const setSpinSpeed = useCallback(
    (spinSpeed: SpinSpeed) => {
      updatePrefs({ spinSpeed });
    },
    [updatePrefs]
  );

  const applyPalette = useCallback(
    (paletteId: WheelPaletteId) => {
      if (isSpinningRef.current) return;
      const paletteColors = getPaletteColors(paletteId);
      setStoredPrefs({
        ...prefs,
        paletteId,
      });
      setStoredEntries(
        entries.map((item, idx) => ({
          ...item,
          color: paletteColors[idx % paletteColors.length],
        }))
      );
    },
    [entries, prefs, setStoredEntries, setStoredPrefs]
  );

  const handleCopyLastWinner = useCallback(async () => {
    const latest = winnerModalRecord ?? history[0];
    if (!latest) {
      toast.info('Spin the wheel first to copy a result');
      return;
    }
    try {
      await navigator.clipboard.writeText(latest.label);
      toast.success(`Copied "${latest.label}" to clipboard`);
    } catch {
      toast.error('Failed to copy winner');
    }
  }, [history, winnerModalRecord]);

  useToolHotkeys(
    {
      onCopy: handleCopyLastWinner,
      onClear: () => {
        if (addInputRef.current) {
          addInputRef.current.value = '';
        }
      },
    },
    { target: addInputRef, enabled: !suppressHotkeys }
  );

  // Dedicated Space key listener to trigger spin when not typing or inside modal dialogs
  useEffect(() => {
    if (suppressHotkeys || typeof window === 'undefined') return;

    const handleSpaceKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== ' ') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (hasOpenModalDialog()) return;

      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.tagName === 'BUTTON' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      spin();
    };

    window.addEventListener('keydown', handleSpaceKey);
    return () => {
      window.removeEventListener('keydown', handleSpaceKey);
    };
  }, [spin, suppressHotkeys]);

  const customShortcuts = useMemo<HotkeyItem[]>(
    () => [
      { symbol: 'Space', label: 'Spin the Wheel' },
      { ...TOOL_HOTKEYS.copy, label: 'Copy Last Winner' },
      { ...TOOL_HOTKEYS.clear, label: 'Clear Add Input' },
      TOOL_HOTKEYS.help,
    ],
    []
  );

  return {
    entries,
    activeEntries,
    eliminatedEntries,
    totalActivePercent,
    slices,
    prefs,
    history,
    rotationRad,
    isSpinning,
    pointerDeflection,
    winnerModalRecord,
    addInputRef,
    customShortcuts,
    setWinnerModalRecord,
    spin,
    addEntry,
    updateEntryLabel,
    updateEntryPercent,
    equalizePercentages,
    normalizePercentages,
    cycleEntryColor,
    removeEntry,
    applyBulkText,
    loadPreset,
    shuffleEntries,
    sortEntries,
    restoreEliminated,
    eliminateEntryById,
    clearAllEntries,
    clearHistory,
    updatePrefs,
    setSpinSpeed,
    applyPalette,
    handleCopyLastWinner,
  };
}
