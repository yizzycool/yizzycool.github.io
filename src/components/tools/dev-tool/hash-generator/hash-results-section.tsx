'use client';

import type {
  HashAlgorithm,
  HashCaseMode,
  HashEncoding,
  HashResultItem as HashResultItemType,
  HmacKeyEncoding,
} from './types';

import { Fingerprint, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

import { CopyAction } from '@/components/shared/action-button';
import { InsetGroup } from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';

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
      <LabelBar label="Calculated Hashes" icon={Fingerprint}>
        <CopyAction
          content={copyAllText}
          label="Copy All"
          disabled={!hasResults}
          successToast="Calculated hashes copied to clipboard"
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

        {/* Hash Results List (shows '---' for empty or initial states) */}
        {!isComputing && (
          <InsetGroup>
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
          </InsetGroup>
        )}
      </div>
    </div>
  );
}
