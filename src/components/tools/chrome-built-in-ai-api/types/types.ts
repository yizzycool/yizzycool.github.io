export type TranslatorInstance = {
  translate: (text: string) => Promise<string>;
};

type LanguageDetectResults = {
  confidence: number;
  detectedLanguage: string;
};

type LanguageDetectorInstance = {
  detect: (text: string) => Promise<Array<LanguageDetectResults>>;
};

export type TranslatorParams = {
  sourceLanguage: string;
  targetLanguage: string;
};

export type WindowAi = {
  ai?: {
    translator?: {
      create: (params: TranslatorParams) => Promise<TranslatorInstance>;
    };
    languageDetector?: {
      create: () => Promise<LanguageDetectorInstance>;
    };
  };
  translation?: {
    createTranslator: (params: TranslatorParams) => Promise<TranslatorInstance>;
  };
};
