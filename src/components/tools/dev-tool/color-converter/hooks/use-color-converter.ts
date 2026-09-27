import type { NormalizedRgba } from '../types';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

import { DEFAULT_COLOR, DEFAULT_RGBA } from '../constants';
import { getAllColorSpaces, rgbaToHex } from '../utils/color-converter';
import {
  getColorHarmonies,
  getShades,
  getTints,
} from '../utils/color-harmonies';
import { parseColorString } from '../utils/color-parser';
import {
  COLOR_BLACK,
  COLOR_WHITE,
  getContrastAgainst,
} from '../utils/contrast-ratio';

export function useColorConverter() {
  const [colorInput, setColorInput] = useState<string>(DEFAULT_COLOR);
  const [currentRgba, setCurrentRgba] = useState<NormalizedRgba>(DEFAULT_RGBA);

  // Parse color and update state
  const handleInputChange = useCallback((input: string) => {
    setColorInput(input);
    const parsed = parseColorString(input);
    if (parsed) {
      setCurrentRgba(parsed);
    }
  }, []);

  // Update directly from preset swatch or native picker
  const handleSelectColor = useCallback((newColor: string) => {
    setColorInput(newColor);
    const parsed = parseColorString(newColor);
    if (parsed) {
      setCurrentRgba(parsed);
    }
  }, []);

  // Reset to default
  const handleReset = useCallback(() => {
    setColorInput(DEFAULT_COLOR);
    setCurrentRgba(DEFAULT_RGBA);
  }, []);

  // Generate random vibrant color
  const handleRandomColor = useCallback(() => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const hex = rgbaToHex({ r, g, b, a: 1 });
    handleSelectColor(hex);
  }, [handleSelectColor]);

  // Modern EyeDropper API (Chromium) - detected via useSyncExternalStore
  const isEyeDropperSupported = useSyncExternalStore(
    subscribe,
    getEyeDropperSnapshot,
    getServerSnapshot
  );

  const handleEyeDropper = useCallback(async () => {
    if (!isEyeDropperSupported) return;
    try {
      // @ts-expect-error EyeDropper is experimental browser API
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        handleSelectColor(result.sRGBHex);
      }
    } catch {
      // User cancelled picker or permission denied
    }
  }, [isEyeDropperSupported, handleSelectColor]);

  // Derived calculations
  const colorSpaces = useMemo(
    () => getAllColorSpaces(currentRgba),
    [currentRgba]
  );

  const contrastAgainstBlack = useMemo(
    () => getContrastAgainst(COLOR_BLACK, currentRgba),
    [currentRgba]
  );

  const contrastAgainstWhite = useMemo(
    () => getContrastAgainst(COLOR_WHITE, currentRgba),
    [currentRgba]
  );

  const tints = useMemo(() => getTints(currentRgba, 5), [currentRgba]);
  const shades = useMemo(() => getShades(currentRgba, 5), [currentRgba]);
  const harmonies = useMemo(
    () => getColorHarmonies(currentRgba),
    [currentRgba]
  );

  return {
    colorInput,
    currentRgba,
    colorSpaces,
    contrastAgainstBlack,
    contrastAgainstWhite,
    tints,
    shades,
    harmonies,
    isEyeDropperSupported,
    handleInputChange,
    handleSelectColor,
    handleRandomColor,
    handleReset,
    handleEyeDropper,
  };
}

function subscribe() {
  return () => {};
}

function getEyeDropperSnapshot() {
  return typeof window !== 'undefined' && 'EyeDropper' in window;
}

function getServerSnapshot() {
  return false;
}
