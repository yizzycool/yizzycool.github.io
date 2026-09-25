'use client';

import { useState } from 'react';
import { defaults, isNull } from 'lodash';

import useAiLanguageModel from './use-ai-language-model';
import { buildRewriterPrompt } from '../utils/rewriter-prompt-builder';

const Options: AIRewriterCreateOptions = {
  sharedContext: '',
  tone: 'as-is',
  format: 'as-is',
  length: 'as-is',
  outputLanguage: 'as-is',
};

const initialSystemPrompt = buildRewriterPrompt('', Options).systemPrompt;

export default function useAiRewriter() {
  const [options, setOptions] = useState<AIRewriterCreateOptions>(Options);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    session,
    prompt,
    promptStreaming,
    updateLanguageModel,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  } = useAiLanguageModel({
    systemPrompt: initialSystemPrompt,
  });

  const updateRewriter = async (
    newRewriterOptions: AIRewriterCreateOptions
  ) => {
    const merged = defaults({}, newRewriterOptions, Options);
    setOptions(merged);
    const { systemPrompt } = buildRewriterPrompt('', merged);
    await updateLanguageModel({ systemPrompt });
  };

  const rewrite = async (text: string): Promise<string | null> => {
    const { userPrompt } = buildRewriterPrompt(text, options);
    return prompt(userPrompt);
  };

  const rewriteStreaming = async (
    text: string,
    callback: (chunk: string) => void
  ): Promise<string | null> => {
    const { userPrompt } = buildRewriterPrompt(text, options);
    return promptStreaming(userPrompt, callback);
  };

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    options,
    isOptionUpdating: isNull(session),
    rewrite,
    rewriteStreaming,
    updateRewriter,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  };
}
