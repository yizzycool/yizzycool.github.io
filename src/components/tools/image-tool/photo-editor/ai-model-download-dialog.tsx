'use client';

import type { AiModelKey } from './types/studio';
import type { PendingModalState } from './hooks/use-ai-worker';

import {
  Cpu,
  Download,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';

import { AI_MODEL_CATALOG } from './constants';

type Props = {
  modalState: PendingModalState | null;
  onConfirm: (chosenModelKey: AiModelKey) => void;
  onCancel: () => void;
};

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSpeed(bps: number): string {
  if (!bps || bps <= 0) return '--';
  const mbps = bps / (1024 * 1024);
  if (mbps >= 1) return `${mbps.toFixed(1)} MB/s`;
  return `${Math.round(bps / 1024)} KB/s`;
}

/**
 * Two-stage local AI model modal reusing BaseDialog:
 * Stage 1 confirms consent, download size, and Fast vs. Studio HD tier before downloading.
 * Stage 2 displays live download progress %, MB transferred, speed, and abort control.
 */
export default function AiModelDownloadDialog({
  modalState,
  onConfirm,
  onCancel,
}: Props) {
  const [selectedCutoutTier, setSelectedCutoutTier] = useState<
    'rmbg-fast' | 'rmbg-hd'
  >('rmbg-fast');

  if (!modalState) return null;

  const isConfirm = modalState.stage === 'confirm';
  const effectiveKey: AiModelKey = isConfirm
    ? modalState.allowQualityChoice
      ? selectedCutoutTier
      : modalState.modelKey
    : modalState.progress.modelKey;
  const spec = AI_MODEL_CATALOG[effectiveKey];

  return (
    <BaseDialog isOpen={Boolean(modalState)} onClose={onCancel}>
      <div className="w-full max-w-md space-y-4 p-6 text-left">
        <DialogHeader
          icon={isConfirm ? Download : Sparkles}
          title={
            isConfirm
              ? `Download ${spec.taskLabel} Model?`
              : `Preparing ${spec.label}`
          }
          description={
            isConfirm
              ? 'First-time download only — cached locally inside your browser.'
              : modalState.progress.phase === 'warming'
                ? 'Initializing WebGPU / WASM tensors...'
                : 'Streaming ONNX model weights into local browser cache...'
          }
          onClose={onCancel}
          closeAriaLabel="Cancel AI download"
        />

        {isConfirm ? (
          <>
            {modalState.allowQualityChoice && (
              <div className="grid grid-cols-2 gap-2">
                {(['rmbg-fast', 'rmbg-hd'] as const).map((tier) => {
                  const tierSpec = AI_MODEL_CATALOG[tier];
                  const active = selectedCutoutTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedCutoutTier(tier)}
                      className={cn(
                        'rounded-xl border p-2.5 text-left transition-colors',
                        active
                          ? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                          : 'border-neutral-200 bg-neutral-50/70 text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300'
                      )}
                    >
                      <div className="text-xs font-bold">{tierSpec.label}</div>
                      <div className="mt-0.5 font-mono text-[11px] opacity-80">
                        ~{tierSpec.estimatedMb.toFixed(0)} MB ·{' '}
                        {tier === 'rmbg-fast' ? 'Fast' : 'Hair Detail'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3.5 text-xs dark:border-neutral-800/80 dark:bg-neutral-900/60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {spec.label}
                </span>
                <span className="rounded-full bg-sky-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  ~{spec.estimatedMb.toFixed(1)} MB
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {spec.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-semibold">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
                  <Cpu className="h-3 w-3" />
                  {modalState.preferredBackend === 'webgpu'
                    ? 'WebGPU Accelerated'
                    : 'WASM CPU Runtime'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-neutral-200/70 px-2 py-0.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  <ShieldCheck className="h-3 w-3" />
                  100% On-Device Cache
                </span>
              </div>
            </div>

            {modalState.lowMemoryWarning && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-300/70 bg-amber-50/80 px-3 py-2 text-[11px] text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Device reports &le; 4 GB RAM. Smaller Fast models are
                  recommended for smoothest performance.
                </span>
              </div>
            )}

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Your images never leave your device. Subsequent runs skip this
              dialog and load straight from local cache.
            </p>

            <div className="flex gap-2.5 pt-1">
              <Button
                size="xs"
                variant="surface"
                bordered
                rounded="xl"
                onClick={onCancel}
                className="flex-1 font-bold"
              >
                Cancel
              </Button>
              <Button
                size="xs"
                variant="primary"
                icon={Download}
                rounded="xl"
                onClick={() => onConfirm(effectiveKey)}
                className="flex-1 font-bold shadow-md"
              >
                Download &amp; Run
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3.5">
            <div className="space-y-1.5 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3.5 dark:border-neutral-800/80 dark:bg-neutral-900/60">
              <div className="flex items-center justify-between text-xs">
                <span className="max-w-[230px] truncate font-semibold text-neutral-700 dark:text-neutral-200">
                  {modalState.progress.fileName}
                </span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                  {modalState.progress.percent}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <div
                  style={{ width: `${modalState.progress.percent}%` }}
                  className="h-full rounded-full bg-sky-500 transition-[width] duration-150"
                />
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                <span>
                  {formatMb(modalState.progress.loadedBytes)} /{' '}
                  {formatMb(modalState.progress.totalBytes)}
                </span>
                <span>{formatSpeed(modalState.progress.speedBps)}</span>
              </div>
            </div>

            {/* Slot B: Wait-Period Card (Zero CLS) */}
            <div
              data-ad-slot="studio-modal-wait"
              className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-300/80 bg-neutral-50/70 px-3 py-2 text-[11px] text-neutral-500 dark:border-neutral-700/80 dark:bg-neutral-900/50 dark:text-neutral-400"
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span>
                Single-slot Anti-OOM AI runs privately inside your browser
                cache.
              </span>
            </div>

            <Button
              size="xs"
              variant="surface"
              bordered
              rounded="xl"
              onClick={onCancel}
              className="w-full font-bold"
            >
              Cancel Download
            </Button>
          </div>
        )}
      </div>
    </BaseDialog>
  );
}
