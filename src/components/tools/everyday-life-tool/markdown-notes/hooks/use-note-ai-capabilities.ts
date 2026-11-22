'use client';

import type {
  NoteAiActionId,
  NoteAiAvailability,
  NoteAiCapabilities,
  NoteAiResult,
} from '../types';

import { useCallback, useEffect, useState } from 'react';

import toast from '@/utils/toast';

const DEFAULT_CAPABILITIES: NoteAiCapabilities = {
  translator: 'unavailable',
  languageDetector: 'unavailable',
  proofreader: 'unavailable',
  rewriter: 'unavailable',
  summarizer: 'unavailable',
  languageModel: 'unavailable',
  hasAny: false,
};

const ACTION_TITLES: Record<NoteAiActionId, string> = {
  'translate': 'Translation (EN ↔ Traditional Chinese)',
  'proofread': 'Proofread & Grammar Fix',
  'rewrite-casual': 'Casual / Natural Rewrite',
  'rewrite-formal': 'Formal Rewrite',
  'rewrite-shorter': 'Shorter / Concise Rewrite',
  'summarize': 'Key Points Summary',
  'study-card': 'Vocabulary & Phrase Study Card',
  'connected-speech': 'Connected Speech Breakdown',
  'format-markdown': 'Clean Markdown Formatting',
  'suggest-labels': 'Suggested Labels',
};

function isUsableStatus(status: NoteAiAvailability): boolean {
  return status !== 'unavailable';
}

async function probeAvailability(
  checker: () => Promise<AIAvailability | undefined>
): Promise<NoteAiAvailability> {
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
 * Progressive-enhancement hook probing Chrome Built-in AI capabilities individually
 * and falling back to LanguageModel (Prompt API) when specialized APIs are unavailable.
 */
export default function useNoteAiCapabilities() {
  const [capabilities, setCapabilities] =
    useState<NoteAiCapabilities>(DEFAULT_CAPABILITIES);
  const [isRunning, setIsRunning] = useState(false);
  const [activeAction, setActiveAction] = useState<NoteAiActionId | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [aiResult, setAiResult] = useState<NoteAiResult | null>(null);

  const refreshCapabilities = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const [
      translator,
      languageDetector,
      proofreader,
      rewriter,
      summarizer,
      languageModel,
    ] = await Promise.all([
      'Translator' in window
        ? probeAvailability(() =>
            window.Translator.availability({
              sourceLanguage: 'en',
              targetLanguage: 'zh-Hant',
            })
          )
        : Promise.resolve<NoteAiAvailability>('unavailable'),
      'LanguageDetector' in window
        ? probeAvailability(() => window.LanguageDetector.availability())
        : Promise.resolve<NoteAiAvailability>('unavailable'),
      'Proofreader' in window
        ? probeAvailability(() =>
            window.Proofreader.availability({
              expectedInputLanguages: ['en'],
              includeCorrectionTypes: true,
              includeCorrectionExplanations: true,
              correctionExplanationLanguage: 'en',
            })
          )
        : Promise.resolve<NoteAiAvailability>('unavailable'),
      'Rewriter' in window
        ? probeAvailability(() =>
            window.Rewriter.availability({
              tone: 'as-is',
              format: 'markdown',
            })
          )
        : Promise.resolve<NoteAiAvailability>('unavailable'),
      'Summarizer' in window
        ? probeAvailability(() =>
            window.Summarizer.availability({
              type: 'key-points',
              format: 'markdown',
              length: 'short',
            })
          )
        : Promise.resolve<NoteAiAvailability>('unavailable'),
      'LanguageModel' in window
        ? probeAvailability(() => window.LanguageModel.availability())
        : Promise.resolve<NoteAiAvailability>('unavailable'),
    ]);

    const hasAny = [
      translator,
      proofreader,
      rewriter,
      summarizer,
      languageModel,
    ].some(isUsableStatus);

    setCapabilities({
      translator,
      languageDetector,
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
    (action: NoteAiActionId): boolean => {
      const hasPrompt = isUsableStatus(capabilities.languageModel);
      switch (action) {
        case 'translate':
          return isUsableStatus(capabilities.translator) || hasPrompt;
        case 'proofread':
          return isUsableStatus(capabilities.proofreader) || hasPrompt;
        case 'rewrite-casual':
        case 'rewrite-formal':
        case 'rewrite-shorter':
          return isUsableStatus(capabilities.rewriter) || hasPrompt;
        case 'summarize':
          return isUsableStatus(capabilities.summarizer) || hasPrompt;
        case 'study-card':
        case 'connected-speech':
        case 'format-markdown':
        case 'suggest-labels':
          return hasPrompt;
      }
    },
    [capabilities]
  );

  const clearAiResult = useCallback(() => {
    setAiResult(null);
  }, []);

  const runAiAction = useCallback(
    async (
      action: NoteAiActionId,
      targetText: string,
      selectionStart: number | null = null,
      selectionEnd: number | null = null
    ) => {
      const trimmed = targetText.trim();
      if (!trimmed) {
        toast.warning('Write or select some text first');
        return;
      }

      setIsRunning(true);
      setActiveAction(action);
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
        let suggestedLabels: string[] | undefined;

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
          action === 'translate' &&
          isUsableStatus(capabilities.translator) &&
          'Translator' in window
        ) {
          let isChinese = /[\u4e00-\u9fff]/.test(trimmed);
          if (
            isUsableStatus(capabilities.languageDetector) &&
            'LanguageDetector' in window
          ) {
            const detector = await window.LanguageDetector.create();
            try {
              const detected = await detector.detect(trimmed);
              const topLang = detected[0]?.detectedLanguage ?? '';
              if (topLang.startsWith('zh')) {
                isChinese = true;
              } else if (topLang === 'en') {
                isChinese = false;
              }
            } finally {
              detector.destroy?.();
            }
          }

          const sourceLanguage = isChinese ? 'zh-Hant' : 'en';
          const targetLanguage = isChinese ? 'en' : 'zh-Hant';

          const avail = await window.Translator.availability({
            sourceLanguage,
            targetLanguage,
          });

          if (avail !== 'unavailable') {
            const translator = await window.Translator.create({
              sourceLanguage,
              targetLanguage,
              monitor: avail === 'downloadable' ? monitor : undefined,
            });
            destroyable = translator;
            output = await translator.translate(trimmed);
          }
        } else if (
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
          if (res.corrections.length > 0) {
            details = res.corrections
              .slice(0, 5)
              .map(
                (c) =>
                  `• **${c.correction}** (${c.types.join(', ')}): ${c.explanation}`
              )
              .join('\n');
          } else {
            details = 'No grammatical issues detected.';
          }
        } else if (
          (action === 'rewrite-casual' ||
            action === 'rewrite-formal' ||
            action === 'rewrite-shorter') &&
          isUsableStatus(capabilities.rewriter) &&
          'Rewriter' in window
        ) {
          const rewriter = await window.Rewriter.create({
            tone:
              action === 'rewrite-formal'
                ? 'more-formal'
                : action === 'rewrite-casual'
                  ? 'more-casual'
                  : 'as-is',
            length: action === 'rewrite-shorter' ? 'shorter' : 'as-is',
            format: 'markdown',
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
            format: 'markdown',
            length: 'short',
            monitor:
              capabilities.summarizer === 'downloadable' ? monitor : undefined,
          });
          destroyable = summarizer;
          output = await summarizer.summarize(trimmed);
        }

        // Cross-API fallback or Prompt-only learning actions
        if (!output) {
          switch (action) {
            case 'translate': {
              const isChinese = /[\u4e00-\u9fff]/.test(trimmed);
              output = await runPromptFallback(
                isChinese
                  ? 'Translate the user text into natural, idiomatic English. Output only the translation.'
                  : 'Translate the user text into natural Traditional Chinese (繁體中文). Output only the translation.',
                trimmed
              );
              break;
            }
            case 'proofread':
              output = await runPromptFallback(
                'Fix grammar, spelling, and awkward phrasing in the user text. Output only the corrected English text.',
                trimmed
              );
              break;
            case 'rewrite-casual':
              output = await runPromptFallback(
                'Rewrite the English text to sound natural, conversational, and native while preserving meaning. Output Markdown only.',
                trimmed
              );
              break;
            case 'rewrite-formal':
              output = await runPromptFallback(
                'Rewrite the English text in clear, polished, professional English. Output Markdown only.',
                trimmed
              );
              break;
            case 'rewrite-shorter':
              output = await runPromptFallback(
                'Rewrite the text to be much shorter and crisper while preserving every key detail. Output Markdown only.',
                trimmed
              );
              break;
            case 'summarize':
              output = await runPromptFallback(
                'Summarize the note into 3 to 5 concise Markdown bullet points capturing key takeaways.',
                trimmed
              );
              break;
            case 'study-card':
              output = await runPromptFallback(
                'Create a compact English study note in Markdown for the given word or phrase. Include: part of speech, clear English definition, 2 natural example sentences with Traditional Chinese translation wrapped inside ||double pipes|| as spoilers, and 2 common collocations.',
                trimmed
              );
              break;
            case 'connected-speech':
              output = await runPromptFallback(
                'Analyze the English sentence for spoken reductions, linking sounds, elision, or weak forms. Present a clean Markdown bullet list or compact table highlighting how words blend together at natural speaking speed.',
                trimmed
              );
              break;
            case 'format-markdown':
              output = await runPromptFallback(
                'Organize the messy draft notes into clean, well-structured Markdown using headings, bullet points, or tables without inventing new facts.',
                trimmed
              );
              break;
            case 'suggest-labels': {
              output = await runPromptFallback(
                'Analyze this note and suggest 2 to 5 concise English category labels (each 1 to 3 words, Title Case, without #). Output ONLY a comma-separated list of labels.',
                trimmed
              );
              const seen = new Set<string>();
              const parsedLabels = output
                .split(/[\n,;|]+/)
                .map((item) => item.replace(/^[\s#\-*\d.]+/, '').trim())
                .filter((item) => {
                  if (!item || item.length > 32) return false;
                  const lower = item.toLowerCase();
                  if (seen.has(lower)) return false;
                  seen.add(lower);
                  return true;
                })
                .slice(0, 5);
              suggestedLabels =
                parsedLabels.length > 0 ? parsedLabels : undefined;
              break;
            }
          }
        }

        setAiResult({
          action,
          title: ACTION_TITLES[action],
          output: output.trim(),
          details,
          suggestedLabels,
          targetText: trimmed,
          selectionStart,
          selectionEnd,
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
        setActiveAction(null);
        setDownloadProgress(null);
        void refreshCapabilities();
      }
    },
    [capabilities, refreshCapabilities]
  );

  return {
    capabilities,
    isRunning,
    activeAction,
    downloadProgress,
    aiResult,
    clearAiResult,
    isActionAvailable,
    runAiAction,
  };
}
