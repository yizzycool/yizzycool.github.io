'use client';

import type { PromptMessage } from './types';

import { Bot, RotateCcw, SendHorizonal } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isEmpty, size, trim } from 'lodash';

import { ProseMarkdown } from '@/components/shared/markdown';
import { ScrollToBottom } from '@/components/shared/scroll-to-bottom';
import { Button } from '@/components/ui/button';
import useAutoScrollToBottom from '@/hooks/dom/use-auto-scroll-to-bottom';
import { hasOpenModalDialog } from '@/hooks/tools/use-tool-hotkeys';
import { cn } from '@/utils/cn';

type Props = {
  placeholder: string;
  messages: PromptMessage[];
  onMessagesChange: (messages: PromptMessage[]) => void;
  onTurnCompleted?: (messages: PromptMessage[]) => void;
  onNewChat?: () => void;
  promptStreaming: (
    text: string,
    callback: (chunk: string) => void
  ) => Promise<string | null>;
};

export default function Chat({
  placeholder,
  messages,
  onMessagesChange,
  onTurnCompleted,
  onNewChat,
  promptStreaming,
}: Props) {
  const [text, setText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  const handleNewChat = useCallback(() => {
    if (isProcessing) return;
    setText('');
    if (textRef.current) {
      textRef.current.innerHTML = '';
    }
    onNewChat?.();
  }, [isProcessing, onNewChat]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || hasOpenModalDialog()) return;

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (
        isCmdOrCtrl &&
        e.shiftKey &&
        (e.key === 'o' ||
          e.key === 'O' ||
          e.code === 'KeyO' ||
          e.key === 'Backspace')
      ) {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  const { scrollToBottom } = useAutoScrollToBottom(messages, {
    containerRef,
    isStreaming: isProcessing,
    threshold: 50,
  });

  const onInput: React.InputEventHandler<HTMLDivElement> = (event) => {
    setText(event.currentTarget.innerText);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void process();
    }
  };

  const process = async () => {
    if (!textRef.current) return;
    if (isEmpty(trim(textRef.current.innerText))) return;

    const promptText = textRef.current.innerText;
    if (textRef.current) {
      textRef.current.innerHTML = '';
    }
    setText('');

    const userMsg: PromptMessage = { role: 'user', content: promptText };
    const withUser = [...messages, userMsg];
    let assistantText = '';

    onMessagesChange([...withUser, { role: 'assistant', content: '' }]);
    setIsProcessing(true);

    await promptStreaming(promptText, (chunk) => {
      assistantText += chunk;
      onMessagesChange([
        ...withUser,
        { role: 'assistant', content: assistantText },
      ]);
    });

    setIsProcessing(false);
    onTurnCompleted?.([
      ...withUser,
      { role: 'assistant', content: assistantText },
    ]);
  };

  return (
    <div ref={containerRef} className="-mb-12 flex flex-1 flex-col">
      <div className="w-full flex-1 overflow-y-hidden pb-20">
        <div className="h-full w-full">
          <div className="flex w-full flex-col">
            {messages.map((result, idx) => (
              <div
                key={`${result.role}-${idx}`}
                id={`${result.role}-${idx}`}
                className={cn('relative flex items-start', idx !== 0 && 'mt-8')}
              >
                {result.role === 'assistant' && (
                  <div className="relative mx-2 my-1 inline-block rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 p-1">
                    <Bot size={16} className="text-white" />
                    {isProcessing && idx === size(messages) - 1 && (
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
          'bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80 dark:to-transparent',
          '-mx-4 sm:-mx-6 lg:-mx-12',
          'px-4 sm:px-6 lg:px-12',
          'pb-4 pt-8 sm:pb-6'
        )}
      >
        <div
          className={cn(
            'relative flex w-full items-center rounded-[30px] border px-6 py-2 transition-colors',
            'border-neutral-200 dark:border-neutral-600',
            'bg-white/80 dark:bg-neutral-900/80'
          )}
        >
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
              'max-h-[120px] flex-1 overflow-y-auto whitespace-pre-wrap bg-transparent',
              'font-mono text-sm leading-relaxed focus:outline-none',
              'text-slate-700 dark:text-slate-200'
            )}
            onInput={onInput}
            onKeyDown={onKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
          />
          {messages.length > 0 && (
            <Button
              onClick={handleNewChat}
              variant="ghost"
              size="base"
              rounded="full"
              className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              icon={RotateCcw}
              iconStrokeWidth={2}
              disabled={isProcessing}
              title="New Chat (Mod + Shift + O)"
              ariaLabel="Start new chat"
            />
          )}
          <Button
            onClick={() => void process()}
            variant="secondary"
            size="base"
            rounded="full"
            className="ml-2"
            icon={SendHorizonal}
            iconStrokeWidth={2}
            iconClassName=""
            disabled={isEmpty(text) || isProcessing}
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
