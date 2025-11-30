'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import browserUtils from '@/utils/browser-utils';
import ErrorDialog from '@/components/common/dialog/error';
import { FileCode, FileCode2 } from 'lucide-react';
import Textarea from '@/components/common/textarea';
import Title from '../../components/title';
import Description from '../../components/description';
import DeleteAction from '@/components/common/action-button/delete';
import CopyAction from '@/components/common/action-button/copy';
import SwapAction from '@/components/common/action-button/swap';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import PasteAction from '@/components/common/action-button/paste';
import Button from '@/components/common/button';

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const onInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const onClearClick = () => {
    setInput('');
    setOutput('');
    setError(false);
  };

  const onEncodeClick = () => {
    try {
      const encoded = browserUtils.encodeURI(input);
      setOutput(encoded);
    } catch (_e) {
      setError(true);
    }
  };

  const onDecodeClick = () => {
    try {
      const decoded = browserUtils.decodeURI(input);
      setOutput(decoded);
    } catch (_e) {
      setError(true);
    }
  };

  const onSwapClick = () => {
    setInput(output);
    setOutput(input);
    setError(false);
  };

  return (
    <>
      <header>
        <Title>URL Encoder / Decoder</Title>
        <Description>
          Quickly convert URLs into a transmission-safe format or decode
          previously encoded URLs. Supports UTF-8 characters.
        </Description>
      </header>

      {/* Input block */}
      <div className="mb-3 mt-16 flex w-full items-center justify-between">
        <label htmlFor="url-textarea" className="block font-semibold">
          Paste URL below
        </label>
        <div className="flex items-center gap-2">
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
      />

      {/* Action buttons */}
      <div className="mt-10 flex w-full flex-col items-stretch justify-stretch gap-3 sm:flex-row sm:items-center">
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

      {/* Result block */}
      <div className="mb-3 mt-10 flex w-full items-center justify-between">
        <label htmlFor="output" className="block font-semibold">
          Result
        </label>
        <CopyAction
          content={output}
          disabled={_isNull(output) || _isEmpty(output)}
        />
      </div>
      <Textarea
        id="output"
        value={output}
        placeholder="The results will be displayed here..."
        rows={8}
        readOnly
      />

      {/* Error dialog */}
      <ErrorDialog
        open={error}
        onClose={() => setError(false)}
        errorString="Conversion Error! Please check string and try again."
      />
    </>
  );
}
