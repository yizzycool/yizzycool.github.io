'use client';

import type { ChangeEvent } from 'react';
import clsx from 'clsx';
import { useState } from 'react';
import browserUtils from '@/utils/browser-utils';
import ErrorDialog from '@/components/common/dialog/error';
import { FileCode, FileCode2 } from 'lucide-react';
import Title from '../../components/title';
import Description from '../../components/description';
import DeleteAction from '@/components/common/action-button/delete';
import CopyAction from '@/components/common/action-button/copy';
import SwapAction from '@/components/common/action-button/swap';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';

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
    <div className="mx-auto flex min-h-full max-w-screen-lg flex-col items-center px-5 pb-20 lg:px-10">
      <Title>URL Encoder / Decoder</Title>
      <Description>
        Quickly convert URLs into a transmission-safe format or decode
        previously encoded URLs. Supports UTF-8 characters.
      </Description>

      {/* Input block */}
      <div className="mb-2 mt-8 flex w-full items-center justify-between">
        <label htmlFor="textarea" className="block font-semibold">
          Paste URL below
        </label>
        <DeleteAction
          onClick={onClearClick}
          disabled={_isNull(input) || _isEmpty(input)}
        />
      </div>
      <textarea
        id="textarea"
        className={clsx(
          'h-64 w-full resize-none rounded-xl border p-4 font-mono text-sm leading-relaxed shadow-sm outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 lg:h-96',
          'border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:bg-white',
          'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500 dark:focus:bg-neutral-800'
        )}
        value={input}
        onChange={onInputChange}
        placeholder="Paste the URL or text you want to process here..."
      />

      {/* Action buttons */}
      <div className="my-6 flex w-full flex-col items-stretch justify-stretch gap-3 sm:flex-row lg:items-center">
        <button
          className="flex flex-1 items-center justify-center gap-2 justify-self-stretch rounded-lg bg-sky-600 px-4 py-3 font-medium text-white hover:bg-sky-700"
          onClick={onEncodeClick}
        >
          <FileCode size={20} />
          Encode
        </button>
        <button
          className="flex flex-1 items-center justify-center gap-2 justify-self-stretch rounded-lg bg-sky-600 px-4 py-3 font-medium text-white hover:bg-sky-700"
          onClick={onDecodeClick}
        >
          <FileCode2 size={20} />
          Decode
        </button>
        <SwapAction
          onClick={onSwapClick}
          disabled={_isEmpty(input) || _isEmpty(output)}
        />
      </div>

      {/* Result block */}
      <div className="mb-2 flex w-full items-center justify-between">
        <label htmlFor="output" className="block font-semibold">
          Result
        </label>
        <CopyAction
          content={output}
          disabled={_isNull(output) || _isEmpty(output)}
        />
      </div>
      <textarea
        id="output"
        className={clsx(
          'h-64 w-full resize-none rounded-xl border p-4 font-mono text-sm leading-relaxed shadow-sm outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 lg:h-96',
          'border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:bg-white',
          'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500 dark:focus:bg-neutral-800'
        )}
        value={output}
        placeholder="The results will be displayed here..."
        readOnly
      />

      {/* Error dialog */}
      <ErrorDialog
        open={error}
        onClose={() => setError(false)}
        errorString="Conversion Error! Please check string and try again."
      />
    </div>
  );
}
