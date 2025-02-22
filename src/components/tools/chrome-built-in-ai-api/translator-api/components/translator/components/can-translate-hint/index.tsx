'use client';

import {
  AiTranslatorCapilitiesResult,
  TranslatorParams,
} from '@/components/tools/chrome-built-in-ai-api/types/types';
import clsx from 'clsx';
import { useMemo } from 'react';
import useLanguageTagToHumanReadable from '@/components/tools/chrome-built-in-ai-api/hooks/use-language-tag-to-human-readable';

export default function CanTranslateHint({
  params,
  canTranslate,
}: {
  params: TranslatorParams;
  canTranslate: AiTranslatorCapilitiesResult;
}) {
  const { languageTagToHumanReadable } = useLanguageTagToHumanReadable();

  const languagePair = useMemo(() => {
    const source = languageTagToHumanReadable(params.sourceLanguage);
    const target = languageTagToHumanReadable(params.targetLanguage);
    return `"${source} <-> ${target}"`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const bgClass = useMemo(() => {
    if (canTranslate === 'after-download') return 'bg-sky-500/20';
    else if (canTranslate === 'no') return 'bg-red-500/20';
    return null;
  }, [canTranslate]);

  if (canTranslate === 'readily' || canTranslate === '') return null;
  return (
    <div
      className={clsx(
        'absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md px-4 backdrop-blur',
        bgClass
      )}
    >
      {canTranslate === 'after-download' ? (
        <>
          <div>Language model is downloading...</div>
          <div>Please wait a minute</div>
        </>
      ) : (
        <>
          <div>{languagePair} is not supported.</div>
          <div>Please choose another language and try again!</div>
        </>
      )}
    </div>
  );
}
