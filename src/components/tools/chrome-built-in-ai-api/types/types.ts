export type AiApiCapilitiesResult = 'readily' | 'after-download' | 'no' | '';

type TranslatorCapilities = {
  languagePairAvailable: (
    sourceLanguage: string,
    targetLanguage: string
  ) => AiApiCapilitiesResult;
};

type SummarizerCapilities = {
  available: AiApiCapilitiesResult;
};

type LanguageModelCapilities = {
  available: AiApiCapilitiesResult;
  defaultTemperature: number;
  defaultTopK: number;
  maxTopK: number;
};

export type TranslatorInstance = {
  translate: (text: string) => Promise<string>;
  destroy: () => void;
};

export type LanguageDetectResults = {
  confidence: number;
  detectedLanguage: string;
};

export type LanguageDetectorInstance = {
  detect: (text: string) => Promise<Array<LanguageDetectResults>>;
  destroy: () => void;
};

export interface SummarizerInstance extends SummarizerParams {
  summarize: (text: string) => Promise<string>;
  destroy: () => void;
}

export interface LanguageModelInstance {
  prompt: (text: string) => Promise<string>;
  promptStreaming: (text: string) => Array<Promise<string>>;
  destroy: () => void;
  maxTokens: number;
  temperature: number;
  tokensLeft: number;
  tokensSoFar: number;
  topK: number;
}

export type AiTranslatorMonitor = {
  addEventListener: (
    eventType: string,
    callback: (event: { loaded: number; total: number }) => void
  ) => void;
};

export type TranslatorParams = {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: AiTranslatorMonitor) => void;
};

export type SummarizerParams = {
  sharedContext?: string;
  type?: 'key-points' | 'tl;dr' | 'teaser' | 'headline';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
};

export type LanguageModelParams = {
  topK?: number;
  temperature?: number;
  systemPrompt?: string;
  initialPrompts?: Array<{ role: string; content: string }>;
};

export type WindowAi = {
  ai?: {
    translator?: {
      create: (params: TranslatorParams) => Promise<TranslatorInstance>;
      capabilities: () => Promise<TranslatorCapilities>;
    };
    languageDetector?: {
      create: () => Promise<LanguageDetectorInstance>;
    };
    summarizer?: {
      create: (params?: SummarizerParams) => Promise<SummarizerInstance>;
      capabilities: () => Promise<SummarizerCapilities>;
    };
    languageModel?: {
      create: (params?: LanguageModelParams) => Promise<LanguageModelInstance>;
      capabilities: () => Promise<LanguageModelCapilities>;
    };
  };
  translation?: {
    createTranslator: (params: TranslatorParams) => Promise<TranslatorInstance>;
    canTranslate: (params: TranslatorParams) => Promise<AiApiCapilitiesResult>;
  };
};
