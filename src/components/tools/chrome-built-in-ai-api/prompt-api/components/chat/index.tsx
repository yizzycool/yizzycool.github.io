'use client';

import clsx from 'clsx';
import { Bot, SendHorizonal } from 'lucide-react';
import { ChangeEventHandler, useRef, useState } from 'react';
import ProseMarkdown from '@/components/common/markdown/prose-markdown';
import Button from '@/components/common/button';
import _slice from 'lodash/slice';
import _last from 'lodash/last';
import _size from 'lodash/size';
import _split from 'lodash/split';
import _isEmpty from 'lodash/isEmpty';
import _trim from 'lodash/trim';

interface PromptResult {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type Props = {
  placeholder: string;

  promptStreaming: (
    text: string,
    callback: (chunk: string) => void
  ) => Promise<string | null>;

  session?: AILanguageModel | null | undefined;
};

export default function Chat({ placeholder, promptStreaming, session }: Props) {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Array<PromptResult>>([]);
  const [isComposing, setIsCompsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const textRef = useRef<HTMLDivElement | null>(null);

  const onInput: ChangeEventHandler<HTMLDivElement> = (event) => {
    setText(event.target.innerHTML);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      process();
    }
  };

  const process = async () => {
    if (!textRef.current) return;
    if (_isEmpty(_trim(textRef.current.innerText))) return;

    if (textRef.current) {
      textRef.current.innerHTML = '';
    }
    setText('');
    setResults((prev) => [...prev, { role: 'user', content: text }]);
    setResults((prev) => [...prev, { role: 'assistant', content: '' }]);

    setIsProcessing(true);
    await promptStreaming(text, (chunk) => {
      setResults((prev) => [
        ..._slice(prev, 0, -1),
        {
          role: (_last(prev) as PromptResult).role,
          content: (_last(prev) as PromptResult).content + chunk,
        },
      ]);
    });
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      {!!(session as AILanguageModel)?.tokensLeft && (
        <div className="absolute left-0 top-0 bg-neutral-700/20 px-4 py-2 text-xs">
          <span className="hidden sm:inline">Tokens Left:</span>{' '}
          {(session as AILanguageModel)?.tokensLeft}/
          {(session as AILanguageModel)?.maxTokens}
        </div>
      )}
      <div className="w-full flex-1 overflow-y-hidden pb-20">
        <div className="h-full w-full overflow-y-auto">
          <div className="flex w-full flex-col">
            {results.map((result, idx) => (
              <div
                key={`${result.role}-${idx}`}
                id={`${result.role}-${idx}`}
                className={clsx(
                  'relative flex items-start',
                  idx !== 0 && 'mt-8'
                )}
              >
                {result.role === 'assistant' && (
                  <div className="relative mx-2 inline-block rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 p-1">
                    <Bot size={16} className="text-white" />
                    {/* Spinner Ring - Only visible during processing */}
                    {isProcessing && idx === _size(results) - 1 && (
                      <div className="absolute -inset-1 animate-spin rounded-full border-2 border-transparent border-r-indigo-500 border-t-blue-500" />
                    )}
                  </div>
                )}
                <ProseMarkdown
                  className={clsx(
                    'w-fit !max-w-[80%]',
                    result.role === 'user' &&
                      'ml-auto !max-w-[60%] rounded-xl bg-neutral-800 px-5 py-2'
                  )}
                >
                  {result.content}
                </ProseMarkdown>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        className={clsx(
          'sticky -bottom-1 left-1/2 w-full pb-4 pt-8 sm:pb-6',
          'bg-gradient-to-t from-gray-50 from-70% dark:from-neutral-900'
        )}
      >
        <div
          className={clsx(
            'relative flex w-full items-center rounded-[30px] border px-4 py-2 transition-colors',
            'border-neutral-200 dark:border-neutral-700',
            'bg-neutral-100/50 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800'
          )}
        >
          {/* Placeholder  */}
          {_isEmpty(text) && (
            <div
              className={clsx(
                'absolute inset-0 flex items-center px-4 py-2',
                'pointer-events-none text-sm leading-relaxed',
                'text-neutral-400 dark:text-neutral-500'
              )}
            >
              {placeholder}
            </div>
          )}
          <div
            ref={textRef}
            contentEditable
            className={clsx(
              'max-h-[120px] flex-1 overflow-y-auto bg-transparent',
              'font-mono text-sm leading-relaxed focus:outline-none',
              'text-neutral-700 dark:text-neutral-200'
            )}
            onInput={onInput}
            onKeyDown={onKeyDown}
            onCompositionStart={() => setIsCompsing(true)}
            onCompositionEnd={() => setIsCompsing(false)}
          />
          <Button
            onClick={process}
            variant="secondary"
            size="base"
            rounded="full"
            className="ml-4"
            icon={SendHorizonal}
            iconStrokeWidth={2}
            iconClassName=""
            disabled={_isEmpty(text)}
          />
        </div>
      </div>
    </div>
  );
}
