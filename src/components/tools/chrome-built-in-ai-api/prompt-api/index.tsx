'use client';

import type { PromptHistoryData } from './types';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import useAiLanguageModel from '../hooks/use-ai-language-model';
import usePromptChat from './hooks/use-prompt-chat';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import HeaderBlock from '../../common/header-block';
import AiStatusGate from '../ai-status-gate';
import Config from './config';
import Chat from './chat';
import SectionGap from '../../common/section-gap';

export default function PromptApi() {
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

  return (
    <div className="flex h-full min-h-[calc(100dvh_-_68px)] flex-col text-left">
      <HeaderBlock<PromptHistoryData>
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={onRestoreHistory}
        onRenameHistory={onRenameHistory}
        onRemoveHistory={onRemoveHistory}
        onClearHistory={onClearHistory}
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

      {/* Prompt */}
      <AiStatusGate
        hasCheckedAIStatus={hasCheckedAIStatus}
        isApiSupported={isApiSupported}
        apiType={UNSUPPORTED_API_TYPES.chromePromptApi}
        shouldDownloadModel={shouldDownloadModel}
        downloadProgress={downloadProgress}
        downloadModel={downloadModel}
      />

      <div className="absolute right-4 top-24">
        <Config
          options={options}
          isOptionUpdating={isOptionUpdating}
          updateOption={updateLanguageModel}
        />
      </div>
      <Chat
        placeholder="You can ask me anything!"
        messages={messages}
        onMessagesChange={setMessages}
        onTurnCompleted={onTurnCompleted}
        onNewChat={onNewChat}
        isRestoring={isRestoring}
        promptStreaming={promptStreaming}
        session={session}
      />
    </div>
  );
}
