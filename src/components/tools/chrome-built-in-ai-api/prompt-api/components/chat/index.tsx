'use client';

import clsx from 'clsx';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Dialog, DialogPanel } from '@headlessui/react';
import { XIcon } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import _slice from 'lodash/slice';
import _last from 'lodash/last';
import _size from 'lodash/size';
import _split from 'lodash/split';

interface PromptResult {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function Chat({
  promptStreaming,
}: {
  promptStreaming: (
    text: string,
    callback: (chunk: string) => void
  ) => Promise<string | null>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [results, setResults] = useState<Array<PromptResult>>([]);
  const [isComposing, setIsCompsing] = useState(false);

  const [reply, setReply] = useState('');

  const replyTextQueueRef = useRef('');
  const replyTextQueueSizeRef = useRef(0);
  const replyIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) return;
    setText('');
    setResults([]);
  }, [isOpen]);

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const onKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      setText('');
      setResults((prev) => [...prev, { role: 'user', content: text }]);
      setResults((prev) => [...prev, { role: 'assistant', content: '' }]);
      resetReply();
      await promptStreaming(text, (chunk) => {
        replyTextQueueSizeRef.current += _size(chunk);
        replyTextQueueRef.current += chunk;
        startShowReply();
        setResults((prev) => [
          ..._slice(prev, 0, -1),
          {
            role: (_last(prev) as PromptResult).role,
            content: (_last(prev) as PromptResult).content + chunk,
          },
        ]);
      });
    }
  };

  const resetReply = () => {
    setReply('');
    replyIndexRef.current = 0;
    replyTextQueueSizeRef.current = 0;
    replyTextQueueRef.current = '';
  };

  const startShowReply = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (replyIndexRef.current >= replyTextQueueSizeRef.current) return;
    replyIndexRef.current += 1;
    setReply(replyTextQueueRef.current.slice(0, replyIndexRef.current));
    timerRef.current = setTimeout(startShowReply, Math.random() * 20);
  };

  const getLoadingCircle = (size: number) => {
    if (size !== 0 && size === replyIndexRef.current) return '';
    const tripleBacktickCount = _split(reply, '```').length;
    if (tripleBacktickCount % 2 === 0) return '';
    return ` <span class="ignore-all-revert">
        <span class="relative inline-flex size-5 ml-1 align-middle">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-400 opacity-75"></span>
          <span class="relative inline-flex size-5 rounded-full bg-neutral-500"></span>
        </span>
      </span>
      `;
  };

  return (
    <>
      <button
        className={clsx(
          'bg-gradient-to-r from-indigo-500/80 from-10% via-sky-500/80 via-30% to-emerald-500/80 to-90%',
          'w-full rounded-lg p-4 text-lg font-bold transition-opacity duration-200 hover:opacity-90',
          'data-[active=true]:from-neutral-800'
        )}
        onClick={() => setIsOpen(true)}
        data-active={isOpen}
      >
        Start New Chat
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        transition
        className={clsx(
          'fixed inset-0 mt-[68px] flex w-screen items-center justify-center bg-black/50',
          'data-[closed]:opacity-0'
        )}
      >
        <DialogPanel className="flex h-full w-full flex-col items-center space-y-4 backdrop-blur-lg">
          <button
            className="absolute right-0 top-0 p-4"
            onClick={() => setIsOpen(false)}
          >
            <XIcon />
          </button>
          <div className="w-full flex-1 overflow-hidden pb-28">
            <div className="h-full w-full overflow-y-auto p-8 pb-0 md:p-12 md:pb-0">
              <div className="mx-auto flex w-full max-w-[600px] flex-col md:w-[90%]">
                {results.map((result, idx) => (
                  <div key={`${result.role}-${idx}`}>
                    {result.role === 'user' ? (
                      <div className="ml-auto w-fit max-w-[60%] rounded-full bg-neutral-800 px-5 py-2">
                        {result.content}
                      </div>
                    ) : result.role === 'assistant' &&
                      idx !== _size(results) - 1 ? (
                      <Markdown
                        className="all-revert my-8"
                        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                      >
                        {result.content}
                      </Markdown>
                    ) : result.role === 'assistant' ? (
                      <Markdown
                        className="all-revert my-8"
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                      >
                        {reply + getLoadingCircle(_size(result.content))}
                      </Markdown>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 w-[90%] max-w-[600px] -translate-x-1/2">
            <textarea
              autoFocus
              placeholder="You can ask me anything!"
              className={clsx(
                'min-h-30 block w-full flex-1 resize-none rounded-xl border-none bg-neutral-800 px-6 py-4',
                'outline-none focus:outline-none'
              )}
              onChange={onChange}
              value={text}
              onKeyDown={onKeyDown}
              onCompositionStart={() => setIsCompsing(true)}
              onCompositionEnd={() => setIsCompsing(false)}
            />
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
