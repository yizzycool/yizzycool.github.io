'use client';

import type { HotkeyItem } from '@/components/ui/badge';
import type {
  ConverterMode,
  IngredientCategory,
  MeasurementUnit,
  OvenTempUnit,
} from '../types';

import { useCallback, useMemo, useRef, useState } from 'react';

import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import { INGREDIENT_DATABASE } from '../constants';
import { convertIngredient, convertOvenTemp } from '../utils/conversion';

/**
 * Manages ingredient density lookup, recipe batch scaling, oven conversions, and clipboard hotkeys.
 */
export function useBakingConverter() {
  const [mode, setMode] = useState<ConverterMode>('ingredients');
  const [category, setCategory] = useState<IngredientCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] =
    useState<string>('ap-flour');
  const [amountInput, setAmountInput] = useState('1');
  const [unit, setUnit] = useState<MeasurementUnit>('us_cup');
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  const [ovenValue, setOvenValue] = useState('180');
  const [ovenUnit, setOvenUnit] = useState<OvenTempUnit>('c');

  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const filteredIngredients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return INGREDIENT_DATABASE.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!query) return true;
      return item.name.toLowerCase().includes(query);
    });
  }, [category, searchQuery]);

  const selectedIngredient = useMemo(
    () =>
      INGREDIENT_DATABASE.find((item) => item.id === selectedIngredientId) ??
      INGREDIENT_DATABASE[0],
    [selectedIngredientId]
  );

  const parsedAmount = useMemo(() => {
    const n = Number(amountInput);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amountInput]);

  const conversionResult = useMemo(
    () =>
      convertIngredient(
        parsedAmount,
        unit,
        selectedIngredient,
        scaleMultiplier
      ),
    [parsedAmount, scaleMultiplier, selectedIngredient, unit]
  );

  const ovenResult = useMemo(() => {
    const parsed = Number(ovenValue);
    return convertOvenTemp(Number.isFinite(parsed) ? parsed : 180, ovenUnit);
  }, [ovenUnit, ovenValue]);

  const handleReset = useCallback(() => {
    if (mode === 'ingredients') {
      setAmountInput('1');
      setScaleMultiplier(1);
    } else {
      setOvenValue(ovenUnit === 'c' ? '180' : '356');
    }
    toast.info('Converter reset to defaults');
  }, [mode, ovenUnit]);

  const handleCopyAllSummary = useCallback(async () => {
    const text =
      mode === 'ingredients'
        ? conversionResult.summaryText
        : ovenResult.summaryText;

    try {
      await navigator.clipboard.writeText(text);
      toast.success('All equivalents copied');
    } catch {
      toast.error('Clipboard permission denied');
    }
  }, [conversionResult.summaryText, mode, ovenResult.summaryText]);

  const handleSelectOvenUnit = useCallback(
    (nextUnit: OvenTempUnit) => {
      if (nextUnit === ovenUnit) return;
      const current = Number(ovenValue);
      if (Number.isFinite(current)) {
        const converted =
          nextUnit === 'f' ? (current * 9) / 5 + 32 : ((current - 32) * 5) / 9;
        setOvenValue(String(Math.round(converted)));
      }
      setOvenUnit(nextUnit);
    },
    [ovenUnit, ovenValue]
  );

  useToolHotkeys(
    {
      onCopy: handleCopyAllSummary,
      onClear: handleReset,
    },
    { target: amountInputRef }
  );

  const customShortcuts = useMemo<HotkeyItem[]>(
    () => [
      { ...TOOL_HOTKEYS.copy, label: 'Copy All Equivalents' },
      { ...TOOL_HOTKEYS.clear, label: 'Reset Measurement' },
      TOOL_HOTKEYS.help,
    ],
    []
  );

  return {
    mode,
    setMode,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    filteredIngredients,
    selectedIngredient,
    selectedIngredientId,
    setSelectedIngredientId,
    amountInput,
    setAmountInput,
    amountInputRef,
    unit,
    setUnit,
    scaleMultiplier,
    setScaleMultiplier,
    conversionResult,
    ovenValue,
    setOvenValue,
    ovenUnit,
    handleSelectOvenUnit,
    ovenResult,
    handleReset,
    handleCopyAllSummary,
    customShortcuts,
  };
}
