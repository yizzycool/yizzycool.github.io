'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import useAiTranslator from '@/components/tools/chrome-built-in-ai-api/hooks/use-ai-translator';
import LanguageSelector from './components/language-selector';
import SwitchButton from './components/switch-button';
import CanTranslateHint from './components/can-translate-hint';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';

export default function Translator() {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isSupported: _isTranslatorSupported,
    translate,
    params,
    setTranslatorLang,
    canTranslate,
  } = useAiTranslator();

  // If translator update to another language, auto translate to new language when translator is readily
  useEffect(() => {
    if (canTranslate === 'readily' && text) {
      translateString(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canTranslate]);

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (canTranslate !== 'readily') return;
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

  const switchSourceTargetLanguage = () => {
    setTranslatorLang(params.targetLanguage, params.sourceLanguage);
  };

  const changeLanguage = (type: string, languageCode: string) => {
    if (type === 'source') {
      setTranslatorLang(languageCode, params.targetLanguage);
    } else {
      setTranslatorLang(params.sourceLanguage, languageCode);
    }
  };

  return (
    <div className="mt-10 flex flex-col justify-center gap-5 border-t border-neutral-700 px-10 pb-40 pt-10 md:flex-row">
      {/* Input */}
      <div className="flex-1">
        <LanguageSelector
          params={params}
          type="source"
          changeLanguage={changeLanguage}
        />
        <div className="relative">
          <textarea
            autoFocus
            className="block min-h-60 w-full flex-1 resize-none rounded-md border-none bg-transparent px-6 py-4 text-xl outline outline-neutral-400 focus:outline-sky-500"
            onChange={onChange}
            value={text}
            disabled={
              canTranslate === 'after-download' || canTranslate === 'no'
            }
          />
          <CanTranslateHint params={params} canTranslate={canTranslate} />
        </div>
      </div>
      {/* Output */}
      <div className="relative flex-1">
        <SwitchButton onSwitch={switchSourceTargetLanguage} />
        <LanguageSelector
          params={params}
          type="target"
          changeLanguage={changeLanguage}
        />
        <div className="block min-h-60 w-full flex-1 rounded-md bg-neutral-500/50 px-6 py-4 text-left text-xl">
          {translation}
        </div>
      </div>
    </div>
  );
}
