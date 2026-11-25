'use client';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import CardPreview from './card-preview';
import CardStyleControls from './card-style-controls';
import { useWifiCardGenerator } from './hooks/use-wifi-card-generator';
import WifiForm from './wifi-form';

/**
 * Printable Wi-Fi QR Code & share card workbench (Archetype B: 5/7 split live studio).
 */
export default function WifiCardGenerator() {
  const {
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
  } = useWifiCardGenerator();

  return (
    <>
      <HeaderBlock customShortcuts={customShortcuts} />

      <SectionGap />

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start">
        {/* Left Settings & Styling Controls */}
        <div className="order-1 space-y-6 text-left lg:order-none lg:col-span-5">
          <WifiForm
            state={state}
            ssidInputRef={ssidInputRef}
            onUpdate={updateState}
            onLoadSample={handleLoadSample}
            onReset={handleReset}
          />

          <CardStyleControls state={state} onUpdate={updateState} />
        </div>

        {/* Sticky Live Card Stage & Print Actions */}
        <div className="order-2 lg:sticky lg:top-24 lg:order-none lg:col-span-7">
          <CardPreview
            state={state}
            theme={theme}
            qrValue={qrValue}
            hasValidPayload={hasValidPayload}
            qrCanvasRef={qrCanvasRef}
            isCopying={isCopying}
            onLoadSample={handleLoadSample}
            onPrint={handlePrint}
            onDownloadPng={handleDownloadPng}
            onCopyPng={handleCopyPng}
          />
        </div>
      </div>
    </>
  );
}
