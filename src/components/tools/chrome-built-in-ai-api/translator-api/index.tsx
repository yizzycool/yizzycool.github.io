'use client';

import clsx from 'clsx';
import { useRef, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import useAiTranslator from '../hooks/use-ai-translator';
import HeaderBlock from '../../components/header-block';
import LanguageSelector from './components/language-selector';
import UnsupportedCard from '../components/unsupported-card';
import ModelDownloadCard from '../components/model-download-card';
import LoadingSkeleton from '../components/loading-skeleton';
import CopyAction from '@/components/common/action-button/copy';
import SpeakAction from '@/components/common/action-button/speak';
import UnsupportedLanguagePairCard from './components/unsupported-language-pair-card';
import InlineDownloadCard from './components/inline-download-card';
import ErrorDialog from '@/components/common/dialog/error';
import SectionGap from '../../components/section-gap';
import { UnsupportedApiTypes } from '../data/unsupported-types';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';
import _size from 'lodash/size';

export default function TranslatorApi() {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    error,
    options,
    translator,
    translate,
    setTranslatorLang,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  } = useAiTranslator();

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (availability !== 'available') return;
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
    setTranslatorLang(options.targetLanguage, options.sourceLanguage);
  };

  const changeLanguage = (type: string, languageCode: string) => {
    if (type === 'source') {
      setTranslatorLang(languageCode, options.targetLanguage);
    } else {
      setTranslatorLang(options.sourceLanguage, languageCode);
    }
  };

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {/* Translator */}
      {!hasCheckedAIStatus ? (
        <LoadingSkeleton />
      ) : !isApiSupported ? (
        <UnsupportedCard apiType={UnsupportedApiTypes.chromeTranslatorApi} />
      ) : _isNull(translator) && shouldDownloadModel ? (
        <ModelDownloadCard
          onClick={downloadModel}
          progress={downloadProgress}
        />
      ) : (
        <>
          <div
            className={clsx(
              'flex flex-col justify-center rounded-xl border',
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
                  params={options}
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
                  params={options}
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
                  'relative flex h-56 w-full flex-col sm:h-[350px]',
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
                  disabled={availability !== 'available'}
                  placeholder="Enter the text to be translated..."
                />
                {/* Word count */}
                <div className="flex items-center justify-between px-3 py-2">
                  <SpeakAction
                    display="icon"
                    size="sm"
                    disabled={_isEmpty(text)}
                    content={text}
                  />
                  <div className="text-xs opacity-50">{_size(text)} chars</div>
                </div>
              </div>

              {/* output */}
              <div className="relative flex h-64 w-full flex-col sm:h-[350px]">
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
                    display="icon"
                    size="sm"
                    disabled={_isEmpty(translation)}
                    content={translation}
                  />
                  <CopyAction
                    content={translation}
                    disabled={_isEmpty(translation)}
                  />
                </div>

                {shouldDownloadModel && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                    <InlineDownloadCard
                      options={options}
                      progress={downloadProgress || 0}
                    />
                  </div>
                )}
                {availability === 'unavailable' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                    <UnsupportedLanguagePairCard options={options} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <ErrorDialog
        errorString="Something went wrong while translating! Please try again later."
        open={error}
        onClose={resetError}
      />
    </>
  );
}
