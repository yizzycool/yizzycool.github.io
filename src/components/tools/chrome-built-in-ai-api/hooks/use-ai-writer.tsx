'use client';

import { useState } from 'react';
import { defaults, isNull } from 'lodash';

import useAiLanguageModel from './use-ai-language-model';
import { buildWriterPrompt } from '../utils/writer-prompt-builder';

const Options: AIWriterCreateOptions = {
  sharedContext: '',
  tone: 'neutral',
  format: 'markdown',
  length: 'short',
  outputLanguage: 'auto',
};

const initialSystemPrompt = buildWriterPrompt('', Options).systemPrompt;

export default function useAiWriter() {
  const [options, setOptions] = useState<AIWriterCreateOptions>(Options);

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

  const updateWriter = async (newWriterOptions: AIWriterCreateOptions) => {
    const merged = defaults({}, newWriterOptions, Options);
    setOptions(merged);
    const { systemPrompt } = buildWriterPrompt('', merged);
    await updateLanguageModel({ systemPrompt });
  };

  const write = async (text: string): Promise<string | null> => {
    const { userPrompt } = buildWriterPrompt(text, options);
    return prompt(userPrompt);
  };

  const writeStreaming = async (
    text: string,
    callback: (chunk: string) => void
  ): Promise<string | null> => {
    const { userPrompt } = buildWriterPrompt(text, options);
    return promptStreaming(userPrompt, callback);
  };

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    options,
    isOptionUpdating: isNull(session),
    write,
    writeStreaming,
    updateWriter,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  };
}
