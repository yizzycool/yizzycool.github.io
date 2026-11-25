'use client';

import type { PromptHistoryData } from './types';

import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import AiStatusGate from '../ai-status-gate';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import DemoModeBanner from '../demo-mode-banner';
import useAiLanguageModel from '../hooks/use-ai-language-model';
import Chat from './chat';
import Config from './config';
import usePromptChat from './hooks/use-prompt-chat';

export default function PromptApi() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    options,
    isOptionUpdating,
    session,
    promptStreaming,
    updateLanguageModel,
    resetModelWithCustomOptions,
    restoreSessionWithPrompts,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  } = useAiLanguageModel();

  const {
    messages,
    setMessages,
    isRestoring,
    historyList,
    isLoadingHistory,
    onTurnCompleted,
    onNewChat,
    onRestoreHistory,
    onRenameHistory,
    onRemoveHistory,
    onClearHistory,
  } = usePromptChat({
    options,
    resetModelWithCustomOptions,
    restoreSessionWithPrompts,
  });

  const activeIsDemo = isApiSupported === false && isDemoMode;
  const tokensLeft = (session as AILanguageModel | null)?.tokensLeft;
  const maxTokens = (session as AILanguageModel | null)?.maxTokens;

  const handlePromptStreaming = async (
    text: string,
    callback: (chunk: string) => void
  ): Promise<string | null> => {
    if (!activeIsDemo) {
      return promptStreaming(text, callback);
    }

    const reply = `### Interactive Demo Response\n\nYou asked:\n> ${text.trim()}\n\nOpen this page in Chrome Desktop (128+) with Prompt API enabled to run live local inference with **Gemini Nano**.`;

    const words = reply.split(/(?=\s+)/);
    for (const chunk of words) {
      await new Promise((resolve) => setTimeout(resolve, 16));
      callback(chunk);
    }
    return reply;
  };

  return (
    <div className="flex h-full min-h-[calc(100dvh_-_68px)] flex-col text-left">
      <HeaderBlock<PromptHistoryData>
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={onRestoreHistory}
        onRenameHistory={onRenameHistory}
        onRemoveHistory={onRemoveHistory}
        onClearHistory={onClearHistory}
        headerAction={
          <Config
            options={options}
            isOptionUpdating={isOptionUpdating}
            updateOption={updateLanguageModel}
            disabled={activeIsDemo}
          />
        }
        customShortcuts={[
          {
            symbol: 'Enter',
            label: 'Send Message',
            hint: 'Send message when typing in chat',
          },
          {
            symbol: 'Shift + Enter',
            label: 'New Line',
            hint: 'Insert line break',
          },
          {
            symbol: 'Mod + Shift + O',
            label: 'New Chat',
            hint: 'Start new session (or Mod + Shift + Backspace)',
          },
          TOOL_HOTKEYS.history,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      <AiStatusGate
        hasCheckedAIStatus={hasCheckedAIStatus}
        isApiSupported={isApiSupported}
        apiType={UNSUPPORTED_API_TYPES.chromePromptApi}
        shouldDownloadModel={shouldDownloadModel}
        downloadProgress={downloadProgress}
        downloadModel={downloadModel}
        isDemoMode={isDemoMode}
        onEnterDemo={() => setIsDemoMode(true)}
      />

      {activeIsDemo && (
        <DemoModeBanner
          toolName="AI Chat"
          onExitDemo={() => setIsDemoMode(false)}
        />
      )}

      {(isRestoring ||
        (typeof tokensLeft === 'number' && typeof maxTokens === 'number')) && (
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
          {isRestoring ? (
            <>
              <LoaderCircle size={12} className="animate-spin text-sky-500" />
              <span>Restoring model context...</span>
            </>
          ) : (
            <span>
              Context Tokens: {tokensLeft} / {maxTokens}
            </span>
          )}
        </div>
      )}

      <Chat
        placeholder="You can ask me anything!"
        messages={messages}
        onMessagesChange={setMessages}
        onTurnCompleted={onTurnCompleted}
        onNewChat={onNewChat}
        promptStreaming={handlePromptStreaming}
      />
    </div>
  );
}
