'use client';

import type { HotkeyItem } from '@/components/ui/badge';
import type { WifiCardState, WifiCardTheme } from '../types';

import { useCallback, useMemo, useRef, useState } from 'react';

import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { useLocalStorage } from '@/hooks/window/use-local-storage';
import toast from '@/utils/toast';

import {
  DEFAULT_WIFI_CARD_STATE,
  SAMPLE_WIFI_CARD_STATE,
  WIFI_CARD_STORAGE_KEY,
  WIFI_CARD_THEMES,
} from '../constants';
import {
  copyWifiCardPng,
  downloadWifiCardPng,
  printWifiCard,
} from '../utils/card-exporter';
import { buildWifiQrPayload } from '../utils/wifi-uri';

/**
 * Manages Wi-Fi card form state, localStorage draft persistence, QR payload generation, and exports.
 */
export function useWifiCardGenerator() {
  const { value: storedDraft, setValue: setStoredDraft } = useLocalStorage<
    Partial<WifiCardState>
  >(WIFI_CARD_STORAGE_KEY, DEFAULT_WIFI_CARD_STATE);

  const state = useMemo<WifiCardState>(
    () => ({
      ...DEFAULT_WIFI_CARD_STATE,
      ...storedDraft,
    }),
    [storedDraft]
  );

  const [isCopying, setIsCopying] = useState(false);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ssidInputRef = useRef<HTMLInputElement | null>(null);

  const theme = useMemo<WifiCardTheme>(
    () =>
      WIFI_CARD_THEMES.find((item) => item.id === state.themeId) ??
      WIFI_CARD_THEMES[0],
    [state.themeId]
  );

  const qrValue = useMemo(
    () =>
      buildWifiQrPayload({
        ssid: state.ssid,
        password: state.password,
        encryption: state.encryption,
        hidden: state.hidden,
      }),
    [state.ssid, state.password, state.encryption, state.hidden]
  );

  const hasValidPayload = Boolean(qrValue);

  const updateState = useCallback(
    (patch: Partial<WifiCardState>) => {
      setStoredDraft({
        ...state,
        ...patch,
      });
    },
    [setStoredDraft, state]
  );

  const handleLoadSample = useCallback(() => {
    setStoredDraft(SAMPLE_WIFI_CARD_STATE);
  }, [setStoredDraft]);

  const handleReset = useCallback(() => {
    setStoredDraft(DEFAULT_WIFI_CARD_STATE);
  }, [setStoredDraft]);

  const handleDownloadPng = useCallback(() => {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas || !hasValidPayload) {
      toast.info('Enter a Wi-Fi network name (SSID) first');
      return;
    }

    try {
      downloadWifiCardPng(qrCanvas, state, theme);
      toast.success('Wi-Fi card PNG downloaded');
    } catch {
      toast.error('Failed to export Wi-Fi card PNG');
    }
  }, [hasValidPayload, state, theme]);

  const handleCopyPng = useCallback(async () => {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas || !hasValidPayload) {
      toast.info('Enter a Wi-Fi network name (SSID) first');
      return;
    }

    setIsCopying(true);
    try {
      await copyWifiCardPng(qrCanvas, state, theme);
      toast.success('Wi-Fi card copied to clipboard');
    } catch {
      toast.error('Failed to copy image to clipboard');
    } finally {
      setIsCopying(false);
    }
  }, [hasValidPayload, state, theme]);

  const handlePrint = useCallback(() => {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas || !hasValidPayload) {
      toast.info('Enter a Wi-Fi network name (SSID) first');
      return;
    }

    try {
      printWifiCard(qrCanvas, state, theme);
    } catch {
      toast.error('Unable to open print preview');
    }
  }, [hasValidPayload, state, theme]);

  useToolHotkeys(
    {
      onSave: handleDownloadPng,
      onCopy: handleCopyPng,
      onClear: handleReset,
    },
    { target: ssidInputRef }
  );

  const customShortcuts = useMemo<HotkeyItem[]>(
    () => [
      { ...TOOL_HOTKEYS.save, label: 'Download Card PNG' },
      { ...TOOL_HOTKEYS.copy, label: 'Copy Card Image' },
      { ...TOOL_HOTKEYS.clear, label: 'Reset Card Form' },
      TOOL_HOTKEYS.help,
    ],
    []
  );

  return {
    state,
    theme,
    qrValue,
    hasValidPayload,
    qrCanvasRef,
    ssidInputRef,
    updateState,
    handleLoadSample,
    handleReset,
    handleDownloadPng,
    handleCopyPng,
    handlePrint,
    isCopying,
    customShortcuts,
  };
}
