'use client';

import { useCallback, useEffect, useState } from 'react';

import toast from '@/utils/toast';

export type WordCounterAiAvailability =
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'available';

export type WordCounterAiActionId =
  | 'summarize'
  | 'proofread'
  | 'rewrite-shorter'
  | 'rewrite-formal';

export type WordCounterAiCapabilities = {
  proofreader: WordCounterAiAvailability;
  rewriter: WordCounterAiAvailability;
  summarizer: WordCounterAiAvailability;
  languageModel: WordCounterAiAvailability;
  hasAny: boolean;
};

export type WordCounterAiResult = {
  action: WordCounterAiActionId;
  title: string;
  output: string;
  details?: string;
};

const DEFAULT_CAPABILITIES: WordCounterAiCapabilities = {
  proofreader: 'unavailable',
  rewriter: 'unavailable',
  summarizer: 'unavailable',
  languageModel: 'unavailable',
  hasAny: false,
};

const ACTION_TITLES: Record<WordCounterAiActionId, string> = {
  summarize: 'Key Takeaways Summary',
  proofread: 'Proofread & Grammar Fix',
  'rewrite-shorter': 'Concise Rewrite',
  'rewrite-formal': 'Polished / Formal Rewrite',
};

function isUsableStatus(status: WordCounterAiAvailability): boolean {
  return status !== 'unavailable';
}

async function probeAvailability(
  checker: () => Promise<AIAvailability | undefined>
): Promise<WordCounterAiAvailability> {
  try {
    const status = await checker();
    if (
      status === 'available' ||
      status === 'downloadable' ||
      status === 'downloading'
    ) {
      return status;
    }
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
}

/**
 * Non-blocking Chrome Built-in AI hook for Word Counter with per-API probing
 * and automatic LanguageModel fallback.
 */
export default function useWordCounterAi() {
  const [capabilities, setCapabilities] =
    useState<WordCounterAiCapabilities>(DEFAULT_CAPABILITIES);
  const [isRunning, setIsRunning] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [aiResult, setAiResult] = useState<WordCounterAiResult | null>(null);

  const refreshCapabilities = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const [proofreader, rewriter, summarizer, languageModel] =
      await Promise.all([
        'Proofreader' in window
          ? probeAvailability(() =>
              window.Proofreader.availability({
                expectedInputLanguages: ['en'],
                includeCorrectionTypes: true,
                includeCorrectionExplanations: true,
                correctionExplanationLanguage: 'en',
              })
            )
          : Promise.resolve<WordCounterAiAvailability>('unavailable'),
        'Rewriter' in window
          ? probeAvailability(() =>
              window.Rewriter.availability({
                tone: 'as-is',
                format: 'plain-text',
              })
            )
          : Promise.resolve<WordCounterAiAvailability>('unavailable'),
        'Summarizer' in window
          ? probeAvailability(() =>
              window.Summarizer.availability({
                type: 'key-points',
                format: 'plain-text',
                length: 'short',
              })
            )
          : Promise.resolve<WordCounterAiAvailability>('unavailable'),
        'LanguageModel' in window
          ? probeAvailability(() => window.LanguageModel.availability())
          : Promise.resolve<WordCounterAiAvailability>('unavailable'),
      ]);

    const hasAny = [proofreader, rewriter, summarizer, languageModel].some(
      isUsableStatus
    );

    setCapabilities({
      proofreader,
      rewriter,
      summarizer,
      languageModel,
      hasAny,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      await Promise.resolve();
      if (!cancelled) {
        await refreshCapabilities();
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [refreshCapabilities]);

  const isActionAvailable = useCallback(
    (action: WordCounterAiActionId): boolean => {
      const hasPrompt = isUsableStatus(capabilities.languageModel);
      switch (action) {
        case 'summarize':
          return isUsableStatus(capabilities.summarizer) || hasPrompt;
        case 'proofread':
          return isUsableStatus(capabilities.proofreader) || hasPrompt;
        case 'rewrite-shorter':
        case 'rewrite-formal':
          return isUsableStatus(capabilities.rewriter) || hasPrompt;
      }
    },
    [capabilities]
  );

  const clearAiResult = useCallback(() => {
    setAiResult(null);
  }, []);

  const runAiAction = useCallback(
    async (action: WordCounterAiActionId, targetText: string) => {
      const trimmed = targetText.trim();
      if (!trimmed) {
        toast.warning('Enter some text first before running AI Assist');
        return;
      }

      setIsRunning(true);
      setDownloadProgress(null);

      const monitor: AICreateMonitorCallback = (m) => {
        setDownloadProgress(0);
        m.addEventListener('downloadprogress', (e) => {
          setDownloadProgress(e.loaded);
        });
      };

      let destroyable: AIDestroyable | null = null;

      try {
        let output = '';
        let details: string | undefined;

        const runPromptFallback = async (
          systemPrompt: string,
          userContent: string
        ) => {
          if (
            !('LanguageModel' in window) ||
            !isUsableStatus(capabilities.languageModel)
          ) {
            throw new Error('This AI action is not available in your browser.');
          }
          const model = await window.LanguageModel.create({
            systemPrompt,
            monitor,
          });
          destroyable = model;
          return model.prompt(userContent);
        };

        if (
          action === 'proofread' &&
          isUsableStatus(capabilities.proofreader) &&
          'Proofreader' in window
        ) {
          const proofreader = await window.Proofreader.create({
            expectedInputLanguages: ['en'],
            includeCorrectionTypes: true,
            includeCorrectionExplanations: true,
            correctionExplanationLanguage: 'en',
            monitor:
              capabilities.proofreader === 'downloadable' ? monitor : undefined,
          });
          destroyable = proofreader;
          const res = await proofreader.proofread(trimmed);
          output = res.correctedInput;
          details =
            res.corrections.length > 0
              ? `${res.corrections.length} grammar/spelling improvement${res.corrections.length === 1 ? '' : 's'} found.`
              : 'No grammatical issues detected.';
        } else if (
          (action === 'rewrite-shorter' || action === 'rewrite-formal') &&
          isUsableStatus(capabilities.rewriter) &&
          'Rewriter' in window
        ) {
          const rewriter = await window.Rewriter.create({
            tone: action === 'rewrite-formal' ? 'more-formal' : 'as-is',
            length: action === 'rewrite-shorter' ? 'shorter' : 'as-is',
            format: 'plain-text',
            monitor:
              capabilities.rewriter === 'downloadable' ? monitor : undefined,
          });
          destroyable = rewriter;
          output = await rewriter.rewrite(trimmed);
        } else if (
          action === 'summarize' &&
          isUsableStatus(capabilities.summarizer) &&
          'Summarizer' in window
        ) {
          const summarizer = await window.Summarizer.create({
            type: 'key-points',
            format: 'plain-text',
            length: 'short',
            monitor:
              capabilities.summarizer === 'downloadable' ? monitor : undefined,
          });
          destroyable = summarizer;
          output = await summarizer.summarize(trimmed);
        }

        if (!output) {
          switch (action) {
            case 'summarize':
              output = await runPromptFallback(
                'Summarize the user text into 3 to 5 concise bullet points.',
                trimmed
              );
              break;
            case 'proofread':
              output = await runPromptFallback(
                'Fix grammar, spelling, and awkward phrasing. Output only the corrected text.',
                trimmed
              );
              break;
            case 'rewrite-shorter':
              output = await runPromptFallback(
                'Rewrite the text to be much shorter and punchier while keeping every key fact.',
                trimmed
              );
              break;
            case 'rewrite-formal':
              output = await runPromptFallback(
                'Rewrite the text in clear, polished, professional prose.',
                trimmed
              );
              break;
          }
        }

        setAiResult({
          action,
          title: ACTION_TITLES[action],
          output: output.trim(),
          details,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to run Chrome Built-in AI on this text';
        toast.error(message);
      } finally {
        destroyable?.destroy?.();
        setIsRunning(false);
        setDownloadProgress(null);
        void refreshCapabilities();
      }
    },
    [capabilities, refreshCapabilities]
  );

  return {
    capabilities,
    isRunning,
    downloadProgress,
    aiResult,
    clearAiResult,
    isActionAvailable,
    runAiAction,
  };
}
