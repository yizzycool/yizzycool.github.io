'use client';

import { ChangeEvent, useRef, useState } from 'react';
import useAiTranslator from '../../hooks/use-ai-translator';
import useAiLanguageDetector from '../../hooks/use-ai-language-detector';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';

export default function Translator() {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isSupported: _isTranslatorSupported, translate } = useAiTranslator();
  const { isSupported: _isLanguageDetectorSupported } = useAiLanguageDetector();

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setText(text);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => translateString(text), 500);
  };

  const translateString = async (text: string) => {
    if (_isEmpty(text)) {
      setTranslation('');
    } else {
      const result = await translate(text);
      setTranslation(result);
    }
  };

  return (
    <div className="mt-10 flex flex-col justify-center gap-5 border-t border-neutral-700 px-10 pb-40 pt-10 md:flex-row">
      {/* Input */}
      <div className="flex-1">
        <textarea
          autoFocus
          className="block min-h-60 w-full flex-1 resize-none rounded-md border-none bg-transparent px-6 py-4 text-xl outline outline-neutral-400 focus:outline-sky-500"
          onChange={onChange}
          value={text}
        />
      </div>
      {/* Output */}
      <div className="flex-1">
        <div className="block min-h-60 w-full flex-1 rounded-md bg-neutral-500/50 px-6 py-4 text-left text-xl">
          {translation}
        </div>
      </div>
    </div>
  );
}
