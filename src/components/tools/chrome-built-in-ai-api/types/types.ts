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

export type TranslatorInstance = {
  translate: (text: string) => Promise<string>;
  destroy: () => void;
};

type LanguageDetectResults = {
  confidence: number;
  detectedLanguage: string;
};

type LanguageDetectorInstance = {
  detect: (text: string) => Promise<Array<LanguageDetectResults>>;
};

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

export type WindowAi = {
  ai?: {
    translator?: {
      create: (params: TranslatorParams) => Promise<TranslatorInstance>;
      capabilities: () => Promise<AiTranslatorCapilities>;
    };
    languageDetector?: {
      create: () => Promise<LanguageDetectorInstance>;
    };
  };
  translation?: {
    createTranslator: (params: TranslatorParams) => Promise<TranslatorInstance>;
    canTranslate: (
      params: TranslatorParams
    ) => Promise<AiTranslatorCapilitiesResult>;
  };
};
