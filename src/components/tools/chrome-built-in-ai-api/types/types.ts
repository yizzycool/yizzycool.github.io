export type AiTranslatorCapilitiesResult =
  | 'readily'
  | 'after-download'
  | 'no'
  | '';

type AiTranslatorCapilities = {
  languagePairAvailable: (
    sourceLanguage: string,
    targetLanguage: string
  ) => AiTranslatorCapilitiesResult;
};

type AiSummarizerCapilities = {
  available: AiTranslatorCapilitiesResult;
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
};

export interface SummarizerInstance extends SummarizerParams {
  summarize: (text: string) => Promise<string>;
  destroy: () => void;
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
  sharedContext: string;
  type: 'key-points' | 'tl;dr' | 'teaser' | 'headline';
  format: 'markdown' | 'plain-text';
  length: 'short' | 'medium' | 'long';
};

export type WindowAi = {
  ai?: {
    translator?: {
      create: (params: TranslatorParams) => Promise<TranslatorInstance>;
      capabilities: () => Promise<AiTranslatorCapilities>;
    };
    languageDetector?: {
      create: () => Promise<LanguageDetectorInstance>;
    };
    summarizer?: {
      create: (params?: SummarizerParams) => Promise<SummarizerInstance>;
      capabilities: () => Promise<AiSummarizerCapilities>;
    };
  };
  translation?: {
    createTranslator: (params: TranslatorParams) => Promise<TranslatorInstance>;
    canTranslate: (
      params: TranslatorParams
    ) => Promise<AiTranslatorCapilitiesResult>;
  };
};
