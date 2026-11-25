'use client';

import type { QrCodeHistoryData } from './hooks/use-qr-code-generator';

import { ConfirmDialog, useConfirmDialog } from '@/components/ui/dialog';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import ExecuteBar from '../../common/execute-bar';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import Appearance from './appearance';
import useQrCodeGenerator from './hooks/use-qr-code-generator';
import Layout from './layout';
import PayloadForm from './payload-form';
import Preview from './preview';

export default function QrCodeGenerator() {
  const {
    isOpen: isConfirmOpen,
    confirm,
    dialogProps: confirmDialogProps,
  } = useConfirmDialog();

  const {
    payloadType,
    setPayloadType,
    inputText,
    setInputText,
    wifi,
    updateWifi,
    vcard,
    updateVCard,
    email,
    updateEmail,
    computedContent,
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
    logoDataUrl,
    logoSizeRatio,
    setLogoSizeRatio,
    onUploadLogo,
    onRemoveLogo,
    inputRef,
    canvasRef,
    svgContainerRef,
    historyList,
    isLoadingHistory,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    onClear,
    onGenerate,
    onDownloadPng,
    onDownloadSvg,
    onCopy,
    onSendToStudio,
  } = useQrCodeGenerator(isConfirmOpen);

  const handleRequestSendToStudio = (
    target: 'pic-merge-studio' | 'photo-editor'
  ) => {
    const isPicMerge = target === 'pic-merge-studio';
    void confirm({
      title: isPicMerge
        ? 'Add QR Code to PicMerge Studio'
        : 'Open QR Code in Photo Editor Studio',
      message: isPicMerge
        ? 'Add this QR code image layer into your PicMerge Studio collage? Your current PicMerge draft will be preserved.'
        : 'Open this QR code in Photo Editor Studio to add posters, text, or effects? This will replace the current canvas in Photo Editor Studio.',
      confirmText: isPicMerge ? 'Add to PicMerge' : 'Open in Photo Editor',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      onConfirm: () => {
        void onSendToStudio(target);
      },
    });
  };

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

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start">
        {/* 1. Payload Template & Input Section */}
        <div className="order-1 space-y-3 text-left lg:order-none lg:col-span-7">
          <PayloadForm
            payloadType={payloadType}
            onChangePayloadType={setPayloadType}
            inputText={inputText}
            onChangeInputText={setInputText}
            onClearText={onClear}
            inputRef={inputRef}
            wifi={wifi}
            onChangeWifi={updateWifi}
            vcard={vcard}
            onChangeVCard={updateVCard}
            email={email}
            onChangeEmail={updateEmail}
          />
          <ExecuteBar
            label="Generate QR Code"
            disabled={!computedContent}
            onClick={() => onGenerate(true)}
            text={computedContent}
          />
        </div>

        {/* 2. Live Studio Preview Hub */}
        <div className="order-2 lg:sticky lg:top-24 lg:order-none lg:col-span-5 lg:row-span-2">
          <Preview
            canvasRef={canvasRef}
            svgContainerRef={svgContainerRef}
            qrValue={qrValue}
            size={size}
            fgColor={fgColor}
            bgColor={bgColor}
            margin={margin}
            level={level}
            logoDataUrl={logoDataUrl}
            logoSizeRatio={logoSizeRatio}
            onDownloadPng={onDownloadPng}
            onDownloadSvg={onDownloadSvg}
            onCopy={onCopy}
            onRequestSendToStudio={handleRequestSendToStudio}
          />
        </div>

        {/* 3. Appearance & Dimensions Controls */}
        <div className="order-3 space-y-6 text-left lg:order-none lg:col-span-7">
          <Appearance
            fgColor={fgColor}
            setFgColor={setFgColor}
            bgColor={bgColor}
            setBgColor={setBgColor}
            logoDataUrl={logoDataUrl}
            logoSizeRatio={logoSizeRatio}
            setLogoSizeRatio={setLogoSizeRatio}
            onUploadLogo={onUploadLogo}
            onRemoveLogo={onRemoveLogo}
          />

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

      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
