'use client';

import { ArrowRightLeft, BookmarkPlus } from 'lucide-react';
import { isEmpty, isNull, size } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import {
  CopyAction,
  DeleteAction,
  PasteAction,
  SpeakAction,
} from '@/components/shared/action-button';
import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import { Button } from '@/components/ui/button';
import { ToolKeys } from '@/data/tools';
import { useToolHistory } from '@/hooks/tools/use-tool-history';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { cn } from '@/utils/cn';
import toast from '@/utils/toast';

import AiStatusGate from '../ai-status-gate';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import DemoModeBanner from '../demo-mode-banner';
import useAiTranslator from '../hooks/use-ai-translator';
import InlineDownloadCard from './inline-download-card';
import LanguageSelector from './language-selector';
import UnsupportedLanguagePairCard from './unsupported-language-pair-card';

type TranslatorHistoryData = {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
};

function buildDemoTranslation(input: string, targetLanguage: string): string {
  return input
    .split(/\r?\n/)
    .map((line) => (line.trim() ? `[Demo → ${targetLanguage}] ${line}` : line))
    .join('\n');
}

export default function TranslatorApi() {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoOptions, setDemoOptions] = useState<AITranslatorCreateCoreOptions>(
    {
      sourceLanguage: 'en',
      targetLanguage: 'zh-Hant',
    }
  );

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

  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistoryWithToast,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<TranslatorHistoryData>(ToolKeys.chromeAiTranslator);

  const activeIsDemo = isApiSupported === false && isDemoMode;
  const activeOptions = activeIsDemo ? demoOptions : options;
  const canEditInput = availability === 'available' || activeIsDemo;

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

    translate(currentText)
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
  }, [translator, translate]);

  const translateString = async (
    nextText: string,
    targetLangOverride?: string
  ) => {
    const requestId = ++translateRequestIdRef.current;
    if (isEmpty(nextText)) {
      setTranslation('');
      return;
    }

    if (activeIsDemo) {
      const targetLang = targetLangOverride ?? demoOptions.targetLanguage;
      setTranslation(buildDemoTranslation(nextText, targetLang));
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
    if (!canEditInput) return;
    const nextText = e.target.value;
    textRef.current = nextText;
    setText(nextText);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      void translateString(nextText);
    }, 450);
  };

  const handlePasteText = (clipText: string) => {
    if (!canEditInput) return;
    textRef.current = clipText;
    setText(clipText);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      void translateString(clipText);
    }, 300);
  };

  const handleClearInput = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    translateRequestIdRef.current += 1;
    textRef.current = '';
    setText('');
    setTranslation('');
  };

  const switchSourceTargetLanguage = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    translateRequestIdRef.current += 1;

    const nextInput = !isEmpty(translation) ? translation : text;
    if (!isEmpty(translation)) {
      textRef.current = translation;
      setText(translation);
    } else {
      textRef.current = text;
    }

    if (activeIsDemo) {
      const nextPair = {
        sourceLanguage: demoOptions.targetLanguage,
        targetLanguage: demoOptions.sourceLanguage,
      };
      setDemoOptions(nextPair);
      setTranslation(
        nextInput
          ? buildDemoTranslation(nextInput, nextPair.targetLanguage)
          : ''
      );
      return;
    }

    setTranslation('');
    void setTranslatorLang(options.targetLanguage, options.sourceLanguage);
  };

  const changeLanguage = (type: string, languageCode: string) => {
    if (
      (type === 'source' && languageCode === activeOptions.targetLanguage) ||
      (type === 'target' && languageCode === activeOptions.sourceLanguage)
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

    if (activeIsDemo) {
      const nextPair =
        type === 'source'
          ? { ...demoOptions, sourceLanguage: languageCode }
          : { ...demoOptions, targetLanguage: languageCode };
      setDemoOptions(nextPair);
      setTranslation(
        text ? buildDemoTranslation(text, nextPair.targetLanguage) : ''
      );
      return;
    }

    setTranslation('');
    if (type === 'source') {
      void setTranslatorLang(languageCode, options.targetLanguage);
    } else {
      void setTranslatorLang(options.sourceLanguage, languageCode);
    }
  };

  const handleSaveSnapshot = () => {
    if (!text.trim() || !translation.trim()) return;
    addHistoryWithToast(
      `${activeOptions.sourceLanguage} → ${activeOptions.targetLanguage}: ${text.slice(0, 60)}`,
      {
        sourceText: text,
        translatedText: translation,
        sourceLanguage: activeOptions.sourceLanguage,
        targetLanguage: activeOptions.targetLanguage,
      }
    );
  };

  const handleRestoreHistory = (data: TranslatorHistoryData) => {
    textRef.current = data.sourceText;
    setText(data.sourceText);
    setTranslation(data.translatedText);
    if (activeIsDemo) {
      setDemoOptions({
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
      });
    } else if (
      data.sourceLanguage !== options.sourceLanguage ||
      data.targetLanguage !== options.targetLanguage
    ) {
      void setTranslatorLang(data.sourceLanguage, data.targetLanguage);
    }
    toast.success('Restored translation from history');
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
          handlePasteText(clipText);
        } catch (_e) {
          // ignore
        }
      },
      onClear: handleClearInput,
    },
    { target: inputRef }
  );

  return (
    <>
      <HeaderBlock<TranslatorHistoryData>
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={handleRestoreHistory}
        onRenameHistory={renameHistory}
        onRemoveHistory={removeHistory}
        onClearHistory={clearHistory}
        customShortcuts={[
          { ...TOOL_HOTKEYS.swap, label: 'Swap Languages' },
          TOOL_HOTKEYS.paste,
          { ...TOOL_HOTKEYS.copy, label: 'Copy Translation' },
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
          TOOL_HOTKEYS.history,
        ]}
      />

      <SectionGap />

      <AiStatusGate
        hasCheckedAIStatus={hasCheckedAIStatus}
        isApiSupported={isApiSupported}
        apiType={UNSUPPORTED_API_TYPES.chromeTranslatorApi}
        shouldDownloadModel={isNull(translator) && shouldDownloadModel}
        downloadProgress={downloadProgress}
        downloadModel={downloadModel}
        isDemoMode={isDemoMode}
        onEnterDemo={() => setIsDemoMode(true)}
      />

      {activeIsDemo && (
        <DemoModeBanner
          toolName="AI Translator"
          onExitDemo={() => setIsDemoMode(false)}
        />
      )}

      {/* Rounded Glass Translator Workbench */}
      <div
        className={cn(
          'shadow-2xs flex flex-col justify-center overflow-hidden rounded-2xl border backdrop-blur-md',
          'border-neutral-200/80 bg-white/75 dark:border-neutral-800 dark:bg-neutral-900/55',
          'placeholder-neutral-400 dark:placeholder-neutral-500'
        )}
      >
        {/* Language selector block */}
        <div
          className={cn(
            'flex w-full items-center justify-stretch gap-2 px-3 py-2',
            'border-b border-neutral-200/80 dark:border-neutral-800'
          )}
        >
          <div className="flex-1">
            <LanguageSelector
              params={activeOptions}
              type="source"
              changeLanguage={changeLanguage}
            />
          </div>

          <Button
            variant="outline"
            size="xs"
            rounded="full"
            icon={ArrowRightLeft}
            ariaLabel="Swap languages"
            title="Swap languages (Mod + Shift + S)"
            onClick={switchSourceTargetLanguage}
          />

          <div className="flex-1">
            <LanguageSelector
              params={activeOptions}
              type="target"
              changeLanguage={changeLanguage}
            />
          </div>
        </div>

        {/* Textarea block */}
        <div className="relative flex flex-col sm:flex-row">
          {/* Input pane */}
          <div
            className={cn(
              'relative flex h-60 w-full flex-col sm:h-[360px]',
              'border-b border-neutral-200/80 sm:border-b-0 sm:border-r dark:border-neutral-800'
            )}
          >
            <textarea
              ref={inputRef}
              id="input"
              className={cn(
                'block w-full flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed focus:outline-none',
                'text-slate-800 dark:text-slate-100',
                'placeholder-neutral-400 dark:placeholder-neutral-500'
              )}
              onChange={onChange}
              value={text}
              disabled={!canEditInput}
              placeholder="Enter text to translate (line breaks are preserved)..."
            />

            <div className="flex items-center justify-between gap-2 border-t border-neutral-200/70 px-3 py-2 dark:border-neutral-800/80">
              <div className="flex items-center gap-1.5">
                <SpeakAction
                  display="icon"
                  size="sm"
                  disabled={isEmpty(text)}
                  content={text}
                  lang={activeOptions.sourceLanguage}
                />
                <PasteAction onClick={handlePasteText} />
                <DeleteAction
                  onClick={handleClearInput}
                  disabled={isEmpty(text)}
                />
              </div>

              <div className="font-mono text-xs tabular-nums text-slate-400 dark:text-slate-500">
                {size(text)} chars
              </div>
            </div>
          </div>

          {/* Output pane */}
          <div className="relative flex h-64 w-full flex-col bg-neutral-50/40 sm:h-[360px] dark:bg-neutral-950/25">
            <textarea
              id="output"
              className={cn(
                'block h-full w-full flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed focus:outline-none',
                'text-slate-800 dark:text-slate-100',
                'placeholder-neutral-400 dark:placeholder-neutral-500'
              )}
              value={translation}
              placeholder="Translation appears here..."
              readOnly
            />

            <div className="flex items-center justify-between gap-2 border-t border-neutral-200/70 px-3 py-2 dark:border-neutral-800/80">
              <SpeakAction
                display="icon"
                size="sm"
                disabled={isEmpty(translation)}
                content={translation}
                lang={activeOptions.targetLanguage}
              />

              <div className="flex items-center gap-1.5">
                {!isEmpty(translation) && (
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    icon={BookmarkPlus}
                    onClick={handleSaveSnapshot}
                  >
                    Save
                  </Button>
                )}
                <CopyAction
                  variant="ghost"
                  content={translation}
                  disabled={isEmpty(translation)}
                />
              </div>
            </div>
          </div>

          {!activeIsDemo && shouldDownloadModel && (
            <InlineDownloadCard
              options={options}
              progress={downloadProgress || 0}
            />
          )}

          {!activeIsDemo && availability === 'unavailable' && (
            <UnsupportedLanguagePairCard options={options} />
          )}
        </div>
      </div>
    </>
  );
}
