'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import browserUtils from '@/utils/browser-utils';
import { Code, FileCode, FileCode2, Link2 } from 'lucide-react';
import HeaderBlock from '../../components/header-block';
import Textarea from '@/components/common/textarea';
import Button from '@/components/common/button';
import DeleteAction from '@/components/common/action-button/delete';
import CopyAction from '@/components/common/action-button/copy';
import SwapAction from '@/components/common/action-button/swap';
import PasteAction from '@/components/common/action-button/paste';
import SectionGap from '../../components/section-gap';
import Snackbar from '@/components/common/snackbar';
import Label from '@/components/common/label';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const onInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const onClearClick = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const onEncodeClick = () => {
    try {
      const encoded = browserUtils.encodeURI(input);
      setOutput(encoded);
    } catch (_e) {
      setError('Encode Error');
    }
  };

  const onDecodeClick = () => {
    try {
      const decoded = browserUtils.decodeURI(input);
      setOutput(decoded);
    } catch (_e) {
      setError('Decode Error');
    }
  };

  const onSwapClick = () => {
    setInput(output);
    setOutput(input);
    setError('');
  };

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {/* Input block */}
      <div className="mb-3 flex w-full flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
        <Label htmlFor="url-textarea" icon={Link2}>
          Paste URL below
        </Label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <PasteAction onClick={setInput} />
          <DeleteAction
            onClick={onClearClick}
            disabled={_isNull(input) || _isEmpty(input)}
          />
        </div>
      </div>
      <Textarea
        id="url-textarea"
        placeholder="Paste the URL or text you want to process here..."
        onChange={onInputChange}
        value={input}
        rows={8}
        autoFocus
      />

      <SectionGap />

      {/* Action buttons */}
      <div className="flex w-full flex-col items-stretch justify-stretch gap-3 sm:flex-row sm:items-center">
        <Button
          variant="dark-sky"
          size="lg"
          className="flex-1"
          icon={FileCode}
          onClick={onEncodeClick}
        >
          Encode
        </Button>
        <Button
          variant="dark-sky"
          size="lg"
          className="flex-1"
          icon={FileCode2}
          onClick={onDecodeClick}
        >
          Decode
        </Button>
        <SwapAction
          display="icon"
          onClick={onSwapClick}
          size="lg"
          disabled={_isEmpty(input) || _isEmpty(output)}
        />
      </div>

      <SectionGap />

      {/* Result block */}
      <div className="mb-3 flex w-full flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
        <Label htmlFor="output" icon={Code}>
          Result
        </Label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <CopyAction
            content={output}
            disabled={_isNull(output) || _isEmpty(output)}
          />
        </div>
      </div>
      <Textarea
        id="output"
        value={output}
        placeholder="The results will be displayed here..."
        rows={8}
        readOnly
      />

      <Snackbar
        variant="error"
        open={!!error}
        onClose={() => setError('')}
        content={error}
      />
    </>
  );
}
