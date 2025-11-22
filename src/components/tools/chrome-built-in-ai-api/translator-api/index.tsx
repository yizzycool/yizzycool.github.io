'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import useAiTranslator from '../hooks/use-ai-translator';
import { ArrowRightLeft } from 'lucide-react';
import Title from '../../components/title';
import LanguageSelector from './components/language-selector';
import CanTranslateHint from './components/can-translate-hint';
import Unsupported, {
  UnsupportedApiTypes,
  UnsupportedTypes,
} from '../../components/unsupported';
import LoadingSkeleton from '../components/loading-skeleton';
import Description from '../../components/description';
import CopyAction from '@/components/common/action-button/copy';
import SpeakAction from '@/components/common/action-button/speak';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';
import _size from 'lodash/size';

export default function TranslatorApi() {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isSupported,
    isPartialUnsupported,
    isUserDownloadRequired,
    translate,
    params,
    setTranslatorLang,
    canTranslate,
    triggerUserDownload,
  } = useAiTranslator();

  const isLoading =
    _isNull(isSupported) || (isSupported && _isNull(isPartialUnsupported));

  // If translator update to another language, auto translate to new language when translator is readily
  useEffect(() => {
    if (canTranslate === 'available' && text) {
      translateString(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canTranslate]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (canTranslate !== 'available') return;
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
    <div className="mx-auto max-w-screen-lg px-5 pb-20 text-center lg:px-10">
      <Title>Translator</Title>
      <Description>
        A fast, accurate translation tool powered by Chrome’s built-in Gemini AI
        - no setup, no API key, just instant multilingual translation with
        natural results.
      </Description>
      {/* Translator */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isUserDownloadRequired ? (
        <Unsupported
          apiType={UnsupportedApiTypes.chromeTranslatorApi}
          type={UnsupportedTypes.userDownloadRequired}
          downloadAiModelHandler={triggerUserDownload}
        />
      ) : !isSupported ? (
        <Unsupported
          apiType={UnsupportedApiTypes.chromeTranslatorApi}
          type={UnsupportedTypes.unsupported}
        />
      ) : isPartialUnsupported ? (
        <Unsupported type={UnsupportedTypes.partialUnsupported} />
      ) : (
        <>
          <div
            className={clsx(
              'mt-8 flex flex-col justify-center',
              'rounded-xl border',
              'border-neutral-200 bg-white text-neutral-700 placeholder-neutral-400',
              'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500'
            )}
          >
            {/* Lauguage selector block */}
            <div
              className={clsx(
                'flex w-full items-center justify-stretch gap-3 p-2',
                'border-b border-neutral-200 dark:border-neutral-700'
              )}
            >
              <div className="flex-1">
                <LanguageSelector
                  params={params}
                  type="source"
                  changeLanguage={changeLanguage}
                />
              </div>
              <button
                className={clsx('mx-auto block cursor-pointer px-4')}
                onClick={switchSourceTargetLanguage}
              >
                <ArrowRightLeft className="" size={16} />
              </button>
              <div className="flex-1">
                <LanguageSelector
                  params={params}
                  type="target"
                  changeLanguage={changeLanguage}
                />
              </div>
            </div>

            {/* Textarea block */}
            <div className="flex flex-col sm:flex-row">
              {/* input */}
              <div
                className={clsx(
                  'relative flex h-56 w-full flex-col sm:h-[300px]',
                  'border-b border-neutral-200 sm:border-b-0 sm:border-r dark:border-neutral-700'
                )}
              >
                <textarea
                  id="input"
                  autoFocus
                  className={clsx(
                    'block w-full flex-1 resize-none border-none bg-transparent px-3 py-2 focus:outline-none',
                    'border-neutral-200 bg-white text-neutral-700 placeholder-neutral-400',
                    'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500'
                  )}
                  onChange={onChange}
                  value={text}
                  disabled={canTranslate !== 'available'}
                  placeholder="Enter the text to be translated..."
                />
                {/* Word count */}
                <div className="flex items-center justify-between px-3 py-2">
                  <SpeakAction
                    content={text}
                    disabled={_isEmpty(text)}
                    size={14}
                  />
                  <div className="text-xs opacity-50">{_size(text)} chars</div>
                </div>
                <CanTranslateHint params={params} canTranslate={canTranslate} />
              </div>

              {/* output */}
              <div className="relative flex h-64 w-full flex-col sm:h-[300px]">
                <textarea
                  id="output"
                  className={clsx(
                    'block h-full w-full flex-1 resize-none border-none bg-transparent px-3 py-2 focus:outline-none',
                    'border-neutral-200 bg-white text-neutral-700 placeholder-neutral-400',
                    'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500'
                  )}
                  value={translation}
                  readOnly
                />
                {/* Copy */}
                <div className="flex items-center justify-between border-t border-neutral-200 px-3 py-2 dark:border-neutral-700">
                  <SpeakAction
                    content={translation}
                    disabled={_isEmpty(translation)}
                    size={14}
                  />
                  <CopyAction
                    content={translation}
                    disabled={_isEmpty(translation)}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
