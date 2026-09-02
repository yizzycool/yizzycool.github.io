'use client';

import { cn } from '@/utils/cn';
import { Bot, SendHorizonal } from 'lucide-react';
import { useRef, useState } from 'react';
import { slice, last, size, isEmpty, trim } from 'lodash';

import ProseMarkdown from '@/components/common/markdown/prose-markdown';
import { Button } from '@/components/common/button';
import ScrollToBottom from '@/components/common/scroll-to-bottom';
import useAutoScrollToBottom from '@/hooks/dom/use-auto-scroll-to-bottom';

type PromptResult = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

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
  const [results, setResults] = useState<PromptResult[]>([]);
  const [isComposing, setIsCompsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  const { scrollToBottom } = useAutoScrollToBottom(results, {
    containerRef,
    isStreaming: isProcessing,
    threshold: 50,
  });

  const onInput: React.InputEventHandler<HTMLDivElement> = (event) => {
    setText(event.currentTarget.innerHTML);
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
    if (isEmpty(trim(textRef.current.innerText))) return;

    if (textRef.current) {
      textRef.current.innerHTML = '';
    }
    setText('');
    setResults((prev) => [...prev, { role: 'user', content: text }]);
    setResults((prev) => [...prev, { role: 'assistant', content: '' }]);

    setIsProcessing(true);
    await promptStreaming(text, (chunk) => {
      setResults((prev) => [
        ...slice(prev, 0, -1),
        {
          role: (last(prev) as PromptResult).role,
          content: (last(prev) as PromptResult).content + chunk,
        },
      ]);
    });
    setIsProcessing(false);
  };

  return (
    <div ref={containerRef} className="-mb-12 flex flex-1 flex-col">
      {!!(session as AILanguageModel)?.tokensLeft && (
        <div className="absolute left-0 top-0 bg-neutral-700/20 px-4 py-2 text-xs">
          <span className="hidden sm:inline">Tokens Left:</span>{' '}
          {(session as AILanguageModel)?.tokensLeft}/
          {(session as AILanguageModel)?.maxTokens}
        </div>
      )}
      <div className="w-full flex-1 overflow-y-hidden pb-20">
        <div className="h-full w-full">
          <div className="flex w-full flex-col">
            {results.map((result, idx) => (
              <div
                key={`${result.role}-${idx}`}
                id={`${result.role}-${idx}`}
                className={cn('relative flex items-start', idx !== 0 && 'mt-8')}
              >
                {result.role === 'assistant' && (
                  <div className="relative mx-2 my-1 inline-block rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 p-1">
                    <Bot size={16} className="text-white" />
                    {/* Spinner Ring - Only visible during processing */}
                    {isProcessing && idx === size(results) - 1 && (
                      <div className="absolute -inset-1 animate-spin rounded-full border-2 border-transparent border-r-indigo-500 border-t-blue-500" />
                    )}
                  </div>
                )}
                <ProseMarkdown
                  className={cn(
                    'w-fit !max-w-[80%]',
                    result.role === 'user' &&
                      'ml-auto !max-w-[60%] rounded-xl bg-slate-200/50 px-5 py-2 dark:bg-slate-700/50'
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
        className={cn(
          'sticky -bottom-1 left-0 right-0',
          'backdrop-blur-md',
          '-mx-4 sm:-mx-6 lg:-mx-12',
          'px-4 sm:px-6 lg:px-12',
          'pb-4 pt-8 sm:pb-6'
        )}
      >
        <div
          className={cn(
            'relative flex w-full items-center rounded-[30px] border px-6 py-2 transition-colors',
            'border-neutral-200 dark:border-neutral-600',
            'bg-white/20 dark:bg-neutral-900/20',
            'hover:bg-neutral-100/20 dark:hover:bg-neutral-800/20'
          )}
        >
          {/* Placeholder  */}
          {isEmpty(text) && (
            <div
              className={cn(
                'absolute inset-0 flex items-center px-6 py-2',
                'pointer-events-none text-sm leading-relaxed',
                'text-slate-400 dark:text-slate-500'
              )}
            >
              {placeholder}
            </div>
          )}
          <div
            ref={textRef}
            contentEditable
            className={cn(
              'max-h-[120px] flex-1 overflow-y-auto bg-transparent',
              'font-mono text-sm leading-relaxed focus:outline-none',
              'text-slate-700 dark:text-slate-200'
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
            disabled={isEmpty(text)}
          />
        </div>
      </div>
      <ScrollToBottom
        threshold={1000}
        onClick={() => scrollToBottom(true)}
        className="sticky bottom-24 left-[calc(50%_+_126px)] hidden lg:flex"
      />
    </div>
  );
}
