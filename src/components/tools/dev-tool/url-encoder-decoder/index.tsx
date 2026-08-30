'use client';

import { useState } from 'react';
import { isNull, isEmpty } from 'lodash';

import browserUtils from '@/utils/browser-utils';
import { Code, FileCode, FileCode2, Link2 } from 'lucide-react';
import HeaderBlock from '../../common/header-block';
import Textarea from '@/components/common/textarea';
import Button from '@/components/common/button';
import DeleteAction from '@/components/common/action-button/delete';
import CopyAction from '@/components/common/action-button/copy';
import SwapAction from '@/components/common/action-button/swap';
import PasteAction from '@/components/common/action-button/paste';
import SectionGap from '../../common/section-gap';
import Snackbar from '@/components/common/snackbar';
import LabelBar from '../../common/label-bar';

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      <LabelBar label="Paste URL below" icon={Link2} htmlFor="url-textarea">
        <PasteAction onClick={setInput} />
        <DeleteAction
          onClick={onClearClick}
          disabled={isNull(input) || isEmpty(input)}
        />
      </LabelBar>
      <Textarea
        id="url-textarea"
        placeholder="Paste the URL or text you want to process here..."
        onChange={onInputChange}
        value={input}
        rows={8}
      />

      <SectionGap />

      {/* Action buttons */}
      <div className="flex w-full flex-col items-stretch justify-stretch gap-3 sm:flex-row sm:items-center">
        <Button
          variant="dark-sky"
          className="flex-1 font-bold uppercase"
          icon={FileCode}
          onClick={onEncodeClick}
        >
          Encode
        </Button>
        <Button
          variant="dark-sky"
          className="flex-1 font-bold uppercase"
          icon={FileCode2}
          onClick={onDecodeClick}
        >
          Decode
        </Button>
        <SwapAction
          display="icon"
          onClick={onSwapClick}
          size="lg"
          disabled={isEmpty(input) || isEmpty(output)}
        />
      </div>

      <SectionGap />

      {/* Result block */}
      <LabelBar label="Result" icon={Code} htmlFor="output">
        <CopyAction
          content={output}
          disabled={isNull(output) || isEmpty(output)}
        />
      </LabelBar>
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
