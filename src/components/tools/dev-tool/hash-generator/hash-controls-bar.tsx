'use client';

import type { HashCaseMode, HashEncoding } from './types';

import { KeyRound } from 'lucide-react';

import { PillTabs } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

import {
  HASH_CASE_MODE_LABELS,
  HASH_CASE_MODES,
  HASH_ENCODING_LABELS,
  HASH_ENCODINGS,
} from './constants';

type Props = {
  encoding: HashEncoding;
  setEncoding: (enc: HashEncoding) => void;
  caseMode: HashCaseMode;
  setCaseMode: (mode: HashCaseMode) => void;
  isHmac: boolean;
  setIsHmac: (val: boolean) => void;
};

export default function HashControlsBar({
  encoding,
  setEncoding,
  caseMode,
  setCaseMode,
  isHmac,
  setIsHmac,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3.5 py-1 text-left">
      {/* Encoding Format and Case Mode Selectors */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Format:
          </span>
          <PillTabs
            tabs={HASH_ENCODINGS}
            activeTab={encoding}
            onChange={setEncoding}
            tabLabels={HASH_ENCODING_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Case:
          </span>
          <PillTabs
            tabs={HASH_CASE_MODES}
            activeTab={caseMode}
            onChange={setCaseMode}
            tabLabels={HASH_CASE_MODE_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
          />
        </div>
      </div>

      {/* HMAC Authentication Mode Toggle */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            HMAC Mode
          </span>
        </div>
        <Switch
          checked={isHmac}
          onChange={setIsHmac}
          size="sm"
          aria-label="Toggle HMAC Mode"
        />
      </div>
    </div>
  );
}
