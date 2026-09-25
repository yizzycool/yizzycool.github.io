export type PromptMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type PromptHistoryData = {
  messages: PromptMessage[];
  options?: AILanguageModelCreateOptions;
};
