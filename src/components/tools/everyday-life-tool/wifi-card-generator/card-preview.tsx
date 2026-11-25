'use client';

import type { RefObject } from 'react';
import type { WifiCardState, WifiCardTheme } from './types';

import { Copy, Download, Printer, QrCode, Sparkles, Wifi } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

import { HotkeyBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { cn } from '@/utils/cn';

import { WIFI_LAYOUT_DIMENSIONS } from './constants';

type Props = {
  state: WifiCardState;
  theme: WifiCardTheme;
  qrValue: string;
  hasValidPayload: boolean;
  qrCanvasRef: RefObject<HTMLCanvasElement | null>;
  isCopying: boolean;
  onLoadSample: () => void;
  onPrint: () => void;
  onDownloadPng: () => void;
  onCopyPng: () => void;
};

/**
 * Sticky live card stage displaying the styled printable Wi-Fi tent/card/sticker and export actions.
 */
export default function CardPreview({
  state,
  theme,
  qrValue,
  hasValidPayload,
  qrCanvasRef,
  isCopying,
  onLoadSample,
  onPrint,
  onDownloadPng,
  onCopyPng,
}: Props) {
  const layoutMeta = WIFI_LAYOUT_DIMENSIONS[state.layout];
  const passwordDisplay =
    state.encryption === 'nopass'
      ? 'Open Network (No Password)'
      : state.showPassword
        ? state.password || 'No password entered'
        : '••••••••••••';

  return (
    <div className="w-full space-y-4">
      <div className="relative flex flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md sm:p-6 dark:border-neutral-800/80 dark:bg-neutral-900/60">
        {/* Top Meta Bar */}
        <div className="mb-4 flex w-full items-center justify-between gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Wifi size={14} className="text-sky-500" />
            <span>Card Preview</span>
          </span>
          <span className="rounded-full border border-neutral-200/80 bg-white/90 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-600 dark:border-neutral-700/80 dark:bg-neutral-800/90 dark:text-neutral-300">
            {layoutMeta.printLabel}
          </span>
        </div>

        {/* Dot-Grid Studio Stage */}
        <div
          className={cn(
            'relative flex min-h-[380px] w-full items-center justify-center rounded-xl border p-5 transition-all duration-300 sm:p-7',
            'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#262626_1px,transparent_1px)]',
            hasValidPayload
              ? 'border-neutral-200/80 bg-neutral-50/70 dark:border-neutral-800/80 dark:bg-neutral-950/60'
              : 'border-dashed border-neutral-300/80 bg-neutral-50/40 dark:border-neutral-700/80 dark:bg-neutral-950/30'
          )}
        >
          {hasValidPayload ? (
            <div
              className={cn(
                'transition-all duration-300',
                state.showCutGuides &&
                  'rounded-3xl border border-dashed border-slate-400/70 p-2 dark:border-neutral-600/80'
              )}
            >
              {/* Printable Physical Card Surface */}
              <div
                className={cn(
                  'rounded-2xl border shadow-xl transition-all duration-300',
                  state.layout === 'portrait' &&
                    'w-[290px] p-6 text-center sm:w-[330px] sm:p-7',
                  state.layout === 'landscape' &&
                    'grid w-full max-w-[490px] grid-cols-1 items-center gap-5 p-6 sm:grid-cols-12 sm:p-7',
                  state.layout === 'compact' &&
                    'w-[290px] p-5 text-center sm:w-[320px] sm:p-6'
                )}
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                  color: theme.textPrimary,
                }}
              >
                {state.layout === 'landscape' ? (
                  <>
                    <div className="space-y-4 text-left sm:col-span-7">
                      <div
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: theme.accentSoft,
                          color: theme.accent,
                        }}
                      >
                        <Wifi size={20} strokeWidth={2.25} />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold leading-snug tracking-tight">
                          {state.title.trim() || 'Welcome to Our Wi-Fi'}
                        </h3>
                        {state.subtitle.trim() && (
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: theme.textSecondary }}
                          >
                            {state.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 pt-1">
                        <div
                          className="rounded-xl border px-3 py-2"
                          style={{
                            backgroundColor: theme.surfaceBg,
                            borderColor: theme.cardBorder,
                          }}
                        >
                          <span
                            className="block text-[9px] font-bold uppercase tracking-wider"
                            style={{ color: theme.textSecondary }}
                          >
                            Network Name
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-xs font-semibold">
                            {state.ssid.trim()}
                          </span>
                        </div>

                        <div
                          className="rounded-xl border px-3 py-2"
                          style={{
                            backgroundColor: theme.surfaceBg,
                            borderColor: theme.cardBorder,
                          }}
                        >
                          <span
                            className="block text-[9px] font-bold uppercase tracking-wider"
                            style={{ color: theme.textSecondary }}
                          >
                            {state.encryption === 'nopass'
                              ? 'Security'
                              : 'Password'}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-xs font-semibold">
                            {passwordDisplay}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 sm:col-span-5">
                      <div
                        className="rounded-2xl border p-3 shadow-sm"
                        style={{
                          backgroundColor: theme.qrBg,
                          borderColor: theme.cardBorder,
                        }}
                      >
                        <QRCodeCanvas
                          ref={qrCanvasRef}
                          value={qrValue}
                          size={512}
                          fgColor={theme.qrFg}
                          bgColor={theme.qrBg}
                          marginSize={1}
                          level="H"
                          style={{
                            width: '148px',
                            height: '148px',
                            display: 'block',
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: theme.textSecondary }}
                      >
                        Scan with camera to join
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div
                      className={cn(
                        'inline-flex items-center justify-center rounded-2xl',
                        state.layout === 'compact' ? 'h-9 w-9' : 'h-11 w-11'
                      )}
                      style={{
                        backgroundColor: theme.accentSoft,
                        color: theme.accent,
                      }}
                    >
                      <Wifi
                        size={state.layout === 'compact' ? 18 : 22}
                        strokeWidth={2.25}
                      />
                    </div>

                    <div className="space-y-1">
                      <h3
                        className={cn(
                          'font-bold leading-snug tracking-tight',
                          state.layout === 'compact' ? 'text-base' : 'text-lg'
                        )}
                      >
                        {state.title.trim() || 'Welcome to Our Wi-Fi'}
                      </h3>
                      {state.layout === 'portrait' && state.subtitle.trim() && (
                        <p
                          className="mx-auto max-w-[230px] text-xs leading-relaxed"
                          style={{ color: theme.textSecondary }}
                        >
                          {state.subtitle}
                        </p>
                      )}
                    </div>

                    <div
                      className="rounded-2xl border p-3 shadow-sm"
                      style={{
                        backgroundColor: theme.qrBg,
                        borderColor: theme.cardBorder,
                      }}
                    >
                      <QRCodeCanvas
                        ref={qrCanvasRef}
                        value={qrValue}
                        size={512}
                        fgColor={theme.qrFg}
                        bgColor={theme.qrBg}
                        marginSize={1}
                        level="H"
                        style={{
                          width: state.layout === 'compact' ? '156px' : '172px',
                          height:
                            state.layout === 'compact' ? '156px' : '172px',
                          display: 'block',
                        }}
                      />
                    </div>

                    <div
                      className={cn(
                        'w-full gap-2 text-left',
                        state.layout === 'compact'
                          ? 'grid grid-cols-2'
                          : 'space-y-2'
                      )}
                    >
                      <div
                        className="rounded-xl border px-3 py-2"
                        style={{
                          backgroundColor: theme.surfaceBg,
                          borderColor: theme.cardBorder,
                        }}
                      >
                        <span
                          className="block text-[9px] font-bold uppercase tracking-wider"
                          style={{ color: theme.textSecondary }}
                        >
                          Network Name
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-xs font-semibold">
                          {state.ssid.trim()}
                        </span>
                      </div>

                      <div
                        className="rounded-xl border px-3 py-2"
                        style={{
                          backgroundColor: theme.surfaceBg,
                          borderColor: theme.cardBorder,
                        }}
                      >
                        <span
                          className="block text-[9px] font-bold uppercase tracking-wider"
                          style={{ color: theme.textSecondary }}
                        >
                          {state.encryption === 'nopass'
                            ? 'Security'
                            : 'Password'}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-xs font-semibold">
                          {passwordDisplay}
                        </span>
                      </div>
                    </div>

                    <p
                      className="text-[10px] font-medium"
                      style={{ color: theme.textSecondary }}
                    >
                      {state.encryption === 'nopass'
                        ? 'Open Guest Wi-Fi'
                        : `Scan with camera · ${state.encryption} Secured`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-400 dark:text-neutral-500">
              <div className="shadow-2xs mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/90 dark:border-neutral-700/80 dark:bg-neutral-900/80">
                <QrCode
                  size={30}
                  strokeWidth={1.5}
                  className="text-sky-500/70"
                />
              </div>
              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Enter Your Wi-Fi Network Name (SSID)
              </p>
              <p className="mt-1 max-w-[240px] text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-500">
                Preview your printable guest Wi-Fi tent card in real time with
                zero data uploaded.
              </p>
              <Button
                variant="secondary"
                size="xs"
                rounded="full"
                bordered
                icon={Sparkles}
                onClick={onLoadSample}
                className="mt-4"
              >
                Load Sample Cafe Card
              </Button>
            </div>
          )}
        </div>

        {/* Export & Print Controls */}
        <div className="mt-5 flex w-full flex-col gap-2.5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="primary"
              size="sm"
              rounded="xl"
              icon={Printer}
              onClick={onPrint}
              disabled={!hasValidPayload}
              className="shadow-xs w-full justify-center font-semibold"
              ariaLabel="Print Wi-Fi Card"
            >
              Print Card
            </Button>
            <Button
              variant="secondary"
              size="sm"
              rounded="xl"
              bordered
              icon={Download}
              onClick={onDownloadPng}
              disabled={!hasValidPayload}
              className="w-full justify-center font-semibold"
              ariaLabel="Download Wi-Fi Card PNG"
            >
              Download PNG
            </Button>
          </div>

          <Button
            variant="secondary"
            size="xs"
            rounded="lg"
            icon={Copy}
            onClick={onCopyPng}
            disabled={!hasValidPayload || isCopying}
            className="w-full justify-center"
            ariaLabel="Copy Wi-Fi Card Image"
          >
            {isCopying ? 'Copying Image...' : 'Copy Card Image'}
          </Button>

          <div className="mt-1 hidden items-center gap-2 border-t border-neutral-200/70 pt-3 sm:flex dark:border-neutral-800/70">
            <HotkeyBadge
              items={[{ ...TOOL_HOTKEYS.save, label: 'Download PNG' }]}
            />
            <HotkeyBadge
              items={[{ ...TOOL_HOTKEYS.copy, label: 'Copy Card' }]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
