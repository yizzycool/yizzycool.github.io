'use client';

import { useEffect, useRef, useState } from 'react';
import useAiTranslator from '../hooks/use-ai-translator';
import Title from '../../components/title';
import LanguageSelector from './components/language-selector';
import CanTranslateHint from './components/can-translate-hint';
import SwitchButton from './components/switch-button';
import Unsupported, {
  UnsupportedApiTypes,
  UnsupportedTypes,
} from '../../components/unsupported';
import LoadingSkeleton from '../components/loading-skeleton';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';

export default function TranslatorApi() {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isSupported,
    isPartialUnsupported,
    translate,
    params,
    setTranslatorLang,
    canTranslate,
  } = useAiTranslator();

  const isLoading =
    _isNull(isSupported) || (isSupported && _isNull(isPartialUnsupported));

  // If translator update to another language, auto translate to new language when translator is readily
  useEffect(() => {
    if (canTranslate === 'readily' && text) {
      translateString(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canTranslate]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    <div className="mx-auto pt-[68px] text-center">
      <Title>Translator</Title>
      {/* Translator */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !isSupported ? (
        <Unsupported
          apiType={UnsupportedApiTypes.chromeTranslatorApi}
          type={UnsupportedTypes.unsupported}
        />
      ) : isPartialUnsupported ? (
        <Unsupported type={UnsupportedTypes.partialUnsupported} />
      ) : (
        <>
          <div className="mt-10 flex flex-col justify-center gap-5 px-5 pb-40 pt-20 md:flex-row">
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
                  className="block min-h-60 w-full flex-1 resize-none rounded-md border border-neutral-400/50 bg-transparent px-6 py-4 text-xl focus:outline-none"
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
              <div className="block min-h-60 w-full flex-1 rounded-md bg-neutral-400/20 px-6 py-4 text-left text-xl">
                {translation}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
