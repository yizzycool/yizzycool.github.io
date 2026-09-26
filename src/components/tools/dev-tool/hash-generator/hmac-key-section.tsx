'use client';

import type { HmacKeyEncoding } from './types';

import { Key, ShieldAlert } from 'lucide-react';

import { DeleteAction, PasteAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { Input } from '@/components/ui/input';
import { PillTabs } from '@/components/ui/tabs';

type Props = {
  hmacKey: string;
  setHmacKey: (key: string) => void;
  hmacKeyEncoding: HmacKeyEncoding;
  setHmacKeyEncoding: (enc: HmacKeyEncoding) => void;
};

const KEY_ENCODINGS: HmacKeyEncoding[] = ['utf-8', 'hex'];
const KEY_ENCODING_LABELS: Record<HmacKeyEncoding, string> = {
  'utf-8': 'UTF-8 String',
  'hex': 'Hex Bytes',
};

export default function HmacKeySection({
  hmacKey,
  setHmacKey,
  hmacKeyEncoding,
  setHmacKeyEncoding,
}: Props) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left dark:border-amber-500/20 dark:bg-amber-500/10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            HMAC Secret Key
          </span>
          <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            Enabled
          </span>
        </div>

        <PillTabs
          tabs={KEY_ENCODINGS}
          activeTab={hmacKeyEncoding}
          onChange={setHmacKeyEncoding}
          tabLabels={KEY_ENCODING_LABELS}
          variant="segment"
          size="xs"
          rounded="md"
        />
      </div>

      <div className="space-y-2.5">
        <LabelBar
          label="Secret Key Payload"
          icon={Key}
          htmlFor="hmac-key-input"
        >
          <PasteAction onClick={setHmacKey} />
          <DeleteAction onClick={() => setHmacKey('')} disabled={!hmacKey} />
        </LabelBar>

        <Input
          id="hmac-key-input"
          value={hmacKey}
          onChange={(e) => setHmacKey(e.target.value)}
          placeholder={
            hmacKeyEncoding === 'hex'
              ? 'Enter hex key bytes (e.g. 48656c6c6f)...'
              : 'Enter plain text secret key...'
          }
          className="font-mono text-sm"
        />

        <div className="flex items-center gap-2 text-xs text-amber-600/90 dark:text-amber-400/90">
          <ShieldAlert size={14} className="shrink-0" />
          <p>
            When HMAC is enabled, cryptographic signatures are calculated using
            this key with MD5, SHA-1, and SHA-2 algorithms.
          </p>
        </div>
      </div>
    </div>
  );
}
