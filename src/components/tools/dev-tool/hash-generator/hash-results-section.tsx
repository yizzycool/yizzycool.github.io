'use client';

import type {
  FileMetadata,
  HashAlgorithm,
  HashCaseMode,
  HashEncoding,
  HashInputMode,
  HashResultItem as HashResultItemType,
  HmacKeyEncoding,
} from './types';

import { Fingerprint, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

import { CopyAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { Badge } from '@/components/ui/badge';

import HashControlsBar from './hash-controls-bar';
import HashResultItem from './hash-result-item';
import HmacKeySection from './hmac-key-section';
import { applyCaseMode } from './utils/formatters';

type Props = {
  results: HashResultItemType[];
  encoding: HashEncoding;
  setEncoding: (enc: HashEncoding) => void;
  caseMode: HashCaseMode;
  setCaseMode: (mode: HashCaseMode) => void;
  isHmac: boolean;
  setIsHmac: (val: boolean) => void;
  hmacKey: string;
  setHmacKey: (key: string) => void;
  hmacKeyEncoding: HmacKeyEncoding;
  setHmacKeyEncoding: (enc: HmacKeyEncoding) => void;
  isComputing: boolean;
  isMatchedAlgorithm: (algo: HashAlgorithm) => boolean;
  fileMeta: FileMetadata | null;
  textInput: string;
  inputMode: HashInputMode;
};

export default function HashResultsSection({
  results,
  encoding,
  setEncoding,
  caseMode,
  setCaseMode,
  isHmac,
  setIsHmac,
  hmacKey,
  setHmacKey,
  hmacKeyEncoding,
  setHmacKeyEncoding,
  isComputing,
  isMatchedAlgorithm,
  fileMeta,
  textInput,
  inputMode,
}: Props) {
  const hasResults =
    results.length > 0 && results.some((r) => r.hex || r.base64);

  const copyAllText = useMemo(() => {
    return results
      .map((item) => {
        const rawVal = encoding === 'hex' ? item.hex : item.base64;
        const val = rawVal ? applyCaseMode(rawVal, caseMode) : '';
        const label = isHmac ? `HMAC-${item.algorithm}` : item.algorithm;
        return `${label}: ${val}`;
      })
      .filter(Boolean)
      .join('\n');
  }, [results, encoding, caseMode, isHmac]);

  return (
    <div className="w-full text-left">
      <LabelBar
        label={
          <div className="flex items-center gap-2.5">
            <span>Calculated Hashes</span>
            <Badge size="xs" variant="primary" rounded="full">
              {results.length} Hashes
            </Badge>
          </div>
        }
        icon={Fingerprint}
      >
        <CopyAction
          content={copyAllText}
          label="Copy All"
          disabled={!hasResults}
        />
      </LabelBar>

      <div className="space-y-4">
        {/* Integrated Result Controls Bar */}
        <HashControlsBar
          encoding={encoding}
          setEncoding={setEncoding}
          caseMode={caseMode}
          setCaseMode={setCaseMode}
          isHmac={isHmac}
          setIsHmac={setIsHmac}
        />

        {/* Integrated HMAC Key Section when HMAC Mode is Active */}
        {isHmac && (
          <HmacKeySection
            hmacKey={hmacKey}
            setHmacKey={setHmacKey}
            hmacKeyEncoding={hmacKeyEncoding}
            setHmacKeyEncoding={setHmacKeyEncoding}
          />
        )}

        {/* Loading Spinner */}
        {isComputing && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400 dark:text-neutral-500">
            <Loader2 className="text-primary-500 size-4 animate-spin" />
            <span>Computing hashes...</span>
          </div>
        )}

        {/* Empty State */}
        {!isComputing && !hasResults && (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400 dark:border-neutral-800 dark:text-neutral-500">
            {inputMode === 'file' && !fileMeta
              ? 'Please select or drop a file above to calculate hashes.'
              : !textInput
                ? 'Enter text above to calculate hashes.'
                : 'No hashes available.'}
          </div>
        )}

        {/* Hash Results List */}
        {!isComputing && hasResults && (
          <div className="divide-y divide-neutral-200/70 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-md dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/40">
            {results.map((item) => (
              <HashResultItem
                key={item.algorithm}
                item={item}
                encoding={encoding}
                caseMode={caseMode}
                isHmac={isHmac}
                isMatched={isMatchedAlgorithm(item.algorithm)}
                grouped
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
