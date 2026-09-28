'use client';

import type { ChangeEvent } from 'react';

import LabelBar from '@/components/tools/common/label-bar';
import { DeleteAction, SampleAction } from '@/components/shared/action-button';

import JwtTokenEditor from './jwt-token-editor';

type JwtInputBarProps = {
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  tokenInput: string;
  onInputChange: (val: string) => void;
  onLoadSample: () => void;
  onClear: () => void;
};

export default function JwtInputBar({
  textareaRef,
  tokenInput,
  onInputChange,
  onLoadSample,
  onClear,
}: JwtInputBarProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
  };

  return (
    <div>
      <LabelBar
        label="Encoded Token"
        description="Paste your raw JWT string. Authorization 'Bearer ' prefix is automatically stripped."
        actions={
          <div className="flex items-center gap-1.5">
            <SampleAction
              onClick={onLoadSample}
              ariaLabel="Load sample JWT token"
            />
            <DeleteAction
              onClick={onClear}
              ariaLabel="Clear token input"
              disabled={!tokenInput.length}
            />
          </div>
        }
      />

      <JwtTokenEditor
        textareaRef={textareaRef}
        value={tokenInput}
        onChange={handleChange}
        rows={4}
        placeholder="Paste a JWT token here (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
      />
    </div>
  );
}
