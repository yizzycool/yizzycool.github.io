'use client';

import { useCallback, useRef } from 'react';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import { useColorConverter } from './hooks/use-color-converter';
import ColorHarmoniesSection from './color-harmonies-section';
import ColorInputBar from './color-input-bar';
import ColorPreviewCard from './color-preview-card';
import ColorSpacesSection from './color-spaces-section';
import ContrastAnalyzerSection from './contrast-analyzer-section';

export default function ColorConverter() {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
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
    handleEyeDropper,
  } = useColorConverter();

  // Hotkey handlers
  const handleCopyHex = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(colorSpaces.hex);
      toast.success(`Copied ${colorSpaces.hex}!`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [colorSpaces.hex]);

  const handlePasteColor = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.warning('Clipboard is empty');
        return;
      }
      handleInputChange(text.trim());
      toast.success('Pasted color from clipboard');
    } catch {
      toast.error('Failed to read from clipboard');
    }
  }, [handleInputChange]);

  const handleClearInput = useCallback(() => {
    handleInputChange('');
  }, [handleInputChange]);

  // Global hotkeys: Mod+Shift+C (onCopy), Mod+Shift+V (onPaste), Esc (onClear when input focused)
  useToolHotkeys(
    {
      onCopy: handleCopyHex,
      onPaste: handlePasteColor,
      onClear: handleClearInput,
    },
    {
      target: inputRef,
    }
  );

  return (
    <div>
      <HeaderBlock
        customShortcuts={[
          TOOL_HOTKEYS.paste,
          TOOL_HOTKEYS.copy,
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap size="sm" />

      {/* Top: Input & Controls */}
      <ColorInputBar
        inputRef={inputRef}
        colorInput={colorInput}
        currentHex={colorSpaces.hex}
        isEyeDropperSupported={isEyeDropperSupported}
        onInputChange={handleInputChange}
        onSelectColor={handleSelectColor}
        onRandomColor={handleRandomColor}
        onEyeDropper={handleEyeDropper}
      />

      <SectionGap size="sm" />

      {/* Color preview card */}
      <ColorPreviewCard
        rgba={currentRgba}
        hex={colorSpaces.hex}
        hslString={colorSpaces.hsl}
        rgbString={colorSpaces.rgb}
      />

      <SectionGap size="sm" />

      {/* Color spaces conversion */}
      <ColorSpacesSection
        colorSpaces={colorSpaces}
        currentHex={colorSpaces.hex}
      />

      <SectionGap size="sm" />

      {/* WCAG 2.1 Contrast analyzer */}
      <ContrastAnalyzerSection
        backgroundColorRgba={currentRgba}
        contrastAgainstBlack={contrastAgainstBlack}
        contrastAgainstWhite={contrastAgainstWhite}
      />

      <SectionGap size="sm" />

      {/* Color harmonies and tints/shades */}
      <ColorHarmoniesSection
        currentHex={colorSpaces.hex}
        tints={tints}
        shades={shades}
        harmonies={harmonies}
        onSelectColor={handleSelectColor}
      />
    </div>
  );
}
