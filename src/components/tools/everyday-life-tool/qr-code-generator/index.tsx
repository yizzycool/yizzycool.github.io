'use client';

import type { QrCodeHistoryData } from './hooks/use-qr-code-generator';

import { Link } from 'lucide-react';
import { isNull, isEmpty } from 'lodash';

import useQrCodeGenerator from './hooks/use-qr-code-generator';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import ExecuteBar from '../../common/execute-bar';
import LabelBar from '../../common/label-bar';
import { PasteAction } from '@/components/shared/action-button';
import { DeleteAction } from '@/components/shared/action-button';
import { Textarea } from '@/components/ui/textarea';
import Appearance from './appearance';
import Layout from './layout';
import Preview from './preview';

export default function QrCodeGenerator() {
  const {
    inputText,
    setInputText,
    qrValue,
    size,
    setSize,
    fgColor,
    setFgColor,
    bgColor,
    setBgColor,
    margin,
    setMargin,
    level,
    setLevel,
    inputRef,
    canvasRef,
    historyList,
    isLoadingHistory,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    onInputChange,
    onClear,
    onGenerate,
    onDownload,
    onCopy,
  } = useQrCodeGenerator();

  return (
    <>
      <HeaderBlock<QrCodeHistoryData>
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={onRestoreHistory}
        onRenameHistory={renameHistory}
        onRemoveHistory={removeHistory}
        onClearHistory={clearHistory}
        customShortcuts={[
          { ...TOOL_HOTKEYS.process, label: 'Generate QR Code' },
          { ...TOOL_HOTKEYS.save, label: 'Download PNG' },
          TOOL_HOTKEYS.paste,
          { ...TOOL_HOTKEYS.copy, label: 'Copy Image' },
          { ...TOOL_HOTKEYS.clear, label: 'Clear' },
          TOOL_HOTKEYS.history,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      {/* Responsive Layout:
          - Mobile (< lg): Natural flow (1. Input -> 2. Preview -> 3. Settings)
          - Desktop (lg:): 2-Column Split Dashboard (Left: Input & Settings, Right: Sticky Preview)
      */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start">
        {/* 1. Input Section (Mobile: Order 1, Desktop: Col 1-7 Row 1) */}
        <div className="order-1 space-y-2 text-left lg:order-none lg:col-span-7">
          <LabelBar label="Content or URL" icon={Link} htmlFor="url-textarea">
            <PasteAction onClick={setInputText} />
            <DeleteAction
              onClick={onClear}
              disabled={isNull(inputText) || isEmpty(inputText)}
            />
          </LabelBar>
          <Textarea
            ref={inputRef}
            id="url-textarea"
            placeholder="Enter URL or text to generate your QR Code..."
            onChange={onInputChange}
            value={inputText}
            rows={5}
          />
          <ExecuteBar
            label="Generate QR Code"
            disabled={isEmpty(inputText.trim())}
            onClick={() => onGenerate(true)}
            text={inputText}
            hotkeyLabel="Generate"
          />
        </div>

        {/* 2. Live Preview Hub (Mobile: Order 2 immediately below Input, Desktop: Col 8-12 Sticky) */}
        <div className="order-2 lg:sticky lg:top-24 lg:order-none lg:col-span-5 lg:row-span-2">
          <Preview
            canvasRef={canvasRef}
            qrValue={qrValue}
            size={size}
            fgColor={fgColor}
            bgColor={bgColor}
            margin={margin}
            level={level}
            onDownload={onDownload}
            onCopy={onCopy}
          />
        </div>

        {/* 3. Customization Controls (Mobile: Order 3, Desktop: Col 1-7 Row 2) */}
        <div className="order-3 space-y-6 text-left lg:order-none lg:col-span-7">
          {/* Color Theme Customization */}
          <Appearance
            fgColor={fgColor}
            setFgColor={setFgColor}
            bgColor={bgColor}
            setBgColor={setBgColor}
          />

          {/* Dimensions & Reliability */}
          <Layout
            size={size}
            setSize={setSize}
            margin={margin}
            setMargin={setMargin}
            level={level}
            setLevel={setLevel}
          />
        </div>
      </div>
    </>
  );
}
