'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import browserUtils from '@/utils/browser-utils';
import ErrorDialog from '@/components/common/dialog/error';
import { Trash2 } from 'lucide-react';
import Title from '../../components/title';
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

  return (
    <div className="mx-auto flex min-h-full max-w-screen-lg flex-col items-center px-5 lg:px-10">
      <Title>URL Encoder / Decoder</Title>
      <div className="mt-8 flex w-full items-center justify-end">
        <button
          className="flex items-center rounded-md bg-red-800 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 hover:bg-red-600"
          onClick={onClearClick}
        >
          <Trash2 className="mr-2 h-5 w-5 text-white" />
          Clear
        </button>
        <button
          className="ml-4 items-center rounded-md bg-sky-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 hover:bg-sky-600"
          onClick={onEncodeClick}
        >
          Encode
        </button>
        <button
          className="ml-4 items-center rounded-md bg-sky-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 hover:bg-sky-600"
          onClick={onDecodeClick}
        >
          Decode
        </button>
      </div>
      {/* Textarea block */}
      <div className="mt-8 w-full">
        <label htmlFor="base64-textarea" className="mb-2 block font-bold">
          Paste URL below
        </label>
        <textarea
          id="base64-textarea"
          className="mt-2 h-[300px] w-full resize-none rounded-md bg-white/5 px-3 py-2 text-neutral-700 outline outline-2 outline-neutral-300 focus:outline-sky-600 dark:text-neutral-300"
          value={input}
          onChange={onInputChange}
        />
      </div>
      {/* Result block */}
      <div className="mt-8 w-full">
        <div className="mb-2 block font-bold">Result</div>
        <div className="mt-2 h-[300px] w-full resize-none rounded-md bg-white/5 px-3 py-2 text-neutral-700 outline outline-2 outline-neutral-300 focus:outline-sky-600 dark:text-neutral-300">
          {output}
        </div>
      </div>
      {/* Error dialog */}
      <ErrorDialog
        open={error}
        onClose={() => setError(false)}
        errorString="Conversion Error! Please check string and try again."
      />
    </div>
  );
}
