'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { isNull, isEmpty, size } from 'lodash';

import useAiTranslator from '../hooks/use-ai-translator';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { cn } from '@/utils/cn';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import HeaderBlock from '../../common/header-block';
import LanguageSelector from './language-selector';
import AiStatusGate from '../ai-status-gate';
import { CopyAction } from '@/components/shared/action-button';
import { SpeakAction } from '@/components/shared/action-button';
import UnsupportedLanguagePairCard from './unsupported-language-pair-card';
import InlineDownloadCard from './inline-download-card';
import SectionGap from '../../common/section-gap';

export default function TranslatorApi() {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef = useRef(text);
  const translateRequestIdRef = useRef(0);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    options,
    translator,
    translate,
    setTranslatorLang,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  } = useAiTranslator();

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!translator) return;

    const currentText = textRef.current;
    if (isEmpty(currentText)) return;

    let cancelled = false;
    const requestId = ++translateRequestIdRef.current;

    translator
      .translate(currentText)
      .then((result) => {
        if (!cancelled && translateRequestIdRef.current === requestId) {
          setTranslation(result);
        }
      })
      .catch(() => {
        // Ignore errors from cancelled or destroyed translator instances
      });

    return () => {
      cancelled = true;
    };
  }, [translator]);

  const translateString = async (nextText: string) => {
    const requestId = ++translateRequestIdRef.current;
    if (isEmpty(nextText)) {
      setTranslation('');
      return;
    }

    try {
      const result = await translate(nextText);
      if (translateRequestIdRef.current === requestId) {
        setTranslation(result);
      }
    } catch {
      // Ignore errors from cancelled or destroyed translator instances
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (availability !== 'available') return;
    const nextText = e.target.value;
    textRef.current = nextText;
    setText(nextText);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      void translateString(nextText);
    }, 500);
  };

  const switchSourceTargetLanguage = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    translateRequestIdRef.current += 1;

    if (!isEmpty(translation)) {
      textRef.current = translation;
      setText(translation);
    } else {
      textRef.current = text;
    }
    setTranslation('');
    void setTranslatorLang(options.targetLanguage, options.sourceLanguage);
  };

  const changeLanguage = (type: string, languageCode: string) => {
    if (
      (type === 'source' && languageCode === options.targetLanguage) ||
      (type === 'target' && languageCode === options.sourceLanguage)
    ) {
      switchSourceTargetLanguage();
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    translateRequestIdRef.current += 1;
    textRef.current = text;
    setTranslation('');

    if (type === 'source') {
      void setTranslatorLang(languageCode, options.targetLanguage);
    } else {
      void setTranslatorLang(options.sourceLanguage, languageCode);
    }
  };

  useToolHotkeys(
    {
      onSwap: switchSourceTargetLanguage,
      onCopy: async () => {
        if (!isEmpty(translation)) {
          try {
            await navigator.clipboard.writeText(translation);
          } catch (_e) {
            // ignore
          }
        }
      },
      onPaste: async () => {
        try {
          const clipText = await navigator.clipboard.readText();
          textRef.current = clipText;
          setText(clipText);
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          timerRef.current = setTimeout(() => {
            void translateString(clipText);
          }, 500);
        } catch (_e) {
          // ignore
        }
      },
      onClear: () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        translateRequestIdRef.current += 1;
        textRef.current = '';
        setText('');
        setTranslation('');
      },
    },
    { target: inputRef }
  );

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          { ...TOOL_HOTKEYS.swap, label: 'Swap Languages' },
          TOOL_HOTKEYS.paste,
          { ...TOOL_HOTKEYS.copy, label: 'Copy Translation' },
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      {/* Status Modal */}
      <AiStatusGate
        hasCheckedAIStatus={hasCheckedAIStatus}
        isApiSupported={isApiSupported}
        apiType={UNSUPPORTED_API_TYPES.chromeTranslatorApi}
        shouldDownloadModel={isNull(translator) && shouldDownloadModel}
        downloadProgress={downloadProgress}
        downloadModel={downloadModel}
      />

      {/* Translator */}
      <>
        <div
          className={cn(
            'flex flex-col justify-center overflow-hidden rounded-xl border',
            'border-neutral-200 dark:border-neutral-700',
            'bg-white/40 dark:bg-neutral-900/40',
            'placeholder-neutral-400 dark:placeholder-neutral-500'
          )}
        >
          {/* Lauguage selector block */}
          <div
            className={cn(
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
              className={cn('mx-auto block cursor-pointer px-4')}
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
          <div className="relative flex flex-col sm:flex-row">
            {/* input */}
            <div
              className={cn(
                'relative flex h-56 w-full flex-col sm:h-[350px]',
                'border-b border-neutral-200 sm:border-b-0 sm:border-r dark:border-neutral-700'
              )}
            >
              <textarea
                ref={inputRef}
                id="input"
                className={cn(
                  'block w-full flex-1 resize-none bg-transparent px-3 py-2 focus:outline-none',
                  'text-slate-700 dark:text-slate-200',
                  'placeholder-neutral-400 dark:placeholder-neutral-500'
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
                  disabled={isEmpty(text)}
                  content={text}
                  lang={options.sourceLanguage}
                />
                <div className="text-xs opacity-50">{size(text)} chars</div>
              </div>
            </div>

            {/* output */}
            <div className="relative flex h-64 w-full flex-col sm:h-[350px]">
              <textarea
                id="output"
                className={cn(
                  'block h-full w-full flex-1 resize-none bg-transparent px-3 py-2 focus:outline-none',
                  'text-slate-700 dark:text-slate-200',
                  'placeholder-neutral-400 dark:placeholder-neutral-500'
                )}
                value={translation}
                readOnly
              />
              {/* Copy */}
              <div className="flex items-center justify-between border-t border-neutral-200 px-3 py-2 dark:border-neutral-700">
                <SpeakAction
                  display="icon"
                  size="sm"
                  disabled={isEmpty(translation)}
                  content={translation}
                  lang={options.targetLanguage}
                />
                <CopyAction
                  variant="ghost"
                  content={translation}
                  disabled={isEmpty(translation)}
                />
              </div>
            </div>

            {shouldDownloadModel && (
              <InlineDownloadCard
                options={options}
                progress={downloadProgress || 0}
              />
            )}

            {availability === 'unavailable' && (
              <UnsupportedLanguagePairCard options={options} />
            )}
          </div>
        </div>
      </>
    </>
  );
}
