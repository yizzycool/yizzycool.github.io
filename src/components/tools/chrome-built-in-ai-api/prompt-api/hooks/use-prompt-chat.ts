'use client';

import type { PromptHistoryData, PromptMessage } from '../types';

import { useState, useRef, useCallback } from 'react';

import { ToolKeys } from '@/data/tools';
import { useToolHistory } from '@/hooks/tools/use-tool-history';
import { toast } from '@/utils/toast';

type UsePromptChatParams = {
  options: AILanguageModelCreateOptions;
  resetModelWithCustomOptions: () => void;
  restoreSessionWithPrompts: (
    messages: PromptMessage[],
    customOptions?: AILanguageModelCreateOptions
  ) => Promise<boolean>;
};

export default function usePromptChat({
  options,
  resetModelWithCustomOptions,
  restoreSessionWithPrompts,
}: UsePromptChatParams) {
  const [messages, setMessages] = useState<PromptMessage[]>([]);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const currentSessionIdRef = useRef<string | null>(null);

  const {
    historyList,
    isLoading: isLoadingHistory,
    saveHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<PromptHistoryData>(ToolKeys.chromeAiPrompt);

  const handleTurnCompleted = useCallback(
    async (updatedMessages: PromptMessage[]) => {
      if (updatedMessages.length === 0) return;

      const firstUserMsg =
        updatedMessages.find((m) => m.role === 'user')?.content ||
        'New Conversation';
      const lastAssistantMsg =
        [...updatedMessages].reverse().find((m) => m.role === 'assistant')
          ?.content || '';

      const title = firstUserMsg.slice(0, 40);
      const preview =
        lastAssistantMsg.slice(0, 100) || firstUserMsg.slice(0, 100);

      const savedId = await saveHistory(
        preview,
        {
          messages: updatedMessages,
          options,
        },
        undefined,
        title,
        currentSessionIdRef.current || undefined
      );

      if (savedId) {
        currentSessionIdRef.current = savedId;
      }
    },
    [options, saveHistory]
  );

  const handleNewChat = useCallback(() => {
    currentSessionIdRef.current = null;
    setMessages([]);
    resetModelWithCustomOptions();
    toast.info('Started new conversation');
  }, [resetModelWithCustomOptions]);

  const handleRestoreHistory = useCallback(
    async (data: PromptHistoryData) => {
      if (!data?.messages || data.messages.length === 0) return;

      const matched = historyList.find((item) => item.data === data);
      if (matched) {
        currentSessionIdRef.current = matched.id;
      }

      setMessages(data.messages);
      setIsRestoring(true);

      const success = await restoreSessionWithPrompts(
        data.messages,
        data.options
      );
      setIsRestoring(false);

      if (success) {
        toast.success('Conversation restored with model context');
      } else {
        toast.warning('Conversation loaded (model context limited)');
      }
    },
    [historyList, restoreSessionWithPrompts]
  );

  const handleRemoveHistory = useCallback(
    (id: string) => {
      if (currentSessionIdRef.current === id) {
        currentSessionIdRef.current = null;
      }
      removeHistory(id);
    },
    [removeHistory]
  );

  const handleClearHistory = useCallback(() => {
    currentSessionIdRef.current = null;
    clearHistory();
  }, [clearHistory]);

  return {
    messages,
    setMessages,
    isRestoring,
    historyList,
    isLoadingHistory,
    onTurnCompleted: handleTurnCompleted,
    onNewChat: handleNewChat,
    onRestoreHistory: handleRestoreHistory,
    onRenameHistory: renameHistory,
    onRemoveHistory: handleRemoveHistory,
    onClearHistory: handleClearHistory,
  };
}
