'use client';

import type { HashAlgorithm } from './types';

import { Check, CheckCheck, X } from 'lucide-react';

import { DeleteAction, PasteAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type Props = {
  targetHash: string;
  setTargetHash: (val: string) => void;
  hasTarget: boolean;
  isMatching: boolean;
  matchedAlgorithm: HashAlgorithm | null;
  onClearTarget: () => void;
};

export default function ChecksumMatcherSection({
  targetHash,
  setTargetHash,
  hasTarget,
  isMatching,
  matchedAlgorithm,
  onClearTarget,
}: Props) {
  return (
    <div className="w-full text-left">
      <LabelBar
        label={
          <div className="flex items-center gap-3">
            <span>Checksum Verification</span>
            {hasTarget &&
              (isMatching ? (
                <Badge
                  variant="success"
                  size="sm"
                  rounded="base"
                  icon={Check}
                  className="font-mono text-xs font-semibold"
                >
                  Match Found: {matchedAlgorithm}
                </Badge>
              ) : (
                <Badge
                  variant="error"
                  size="sm"
                  rounded="base"
                  icon={X}
                  className="font-mono text-xs"
                >
                  No Match Found
                </Badge>
              ))}
          </div>
        }
        icon={CheckCheck}
        htmlFor="target-checksum-input"
        description="Automatically checks across all calculated hashes (MD5, SHA-1, SHA-256, SHA-384, SHA-512) and highlights matching entries."
      >
        <PasteAction onClick={setTargetHash} />
        <DeleteAction onClick={onClearTarget} disabled={!targetHash} />
      </LabelBar>

      <Input
        id="target-checksum-input"
        value={targetHash}
        onChange={(e) => setTargetHash(e.target.value)}
        placeholder="Paste checksum to compare (case-insensitive, trims whitespace)..."
        className="font-mono text-sm"
      />
    </div>
  );
}
