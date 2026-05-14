export const UNSUPPORTED_API_TYPES = {
  chromeBuiltInAiApi: 'chrome-built-in-ai-api',
  chromeLanguageDetectorApi: 'chrome-language-detector-api',
  chromePromptApi: 'chrome-prompt-api',
  chromeRewriter: 'chrome-rewriter',
  chromeSummarizerApi: 'chrome-summarizer-api',
  chromeTranslatorApi: 'chrome-translator-api',
  chromeWriter: 'chrome-writer',
  chromeProofreaderApi: 'chrome-proofreader-api',
};

export const CHROME_BUILT_IN_AI_API_FLAGS = {
  [UNSUPPORTED_API_TYPES.chromeLanguageDetectorApi]: 'language-detection-api',
  [UNSUPPORTED_API_TYPES.chromePromptApi]: 'prompt-api-for-gemini-nano',
  [UNSUPPORTED_API_TYPES.chromeRewriter]: 'rewriter-api-for-gemini-nano',
  [UNSUPPORTED_API_TYPES.chromeSummarizerApi]:
    'summarization-api-for-gemini-nano',
  [UNSUPPORTED_API_TYPES.chromeTranslatorApi]: 'translation-api',
  [UNSUPPORTED_API_TYPES.chromeWriter]: 'writer-api-for-gemini-nano',
  [UNSUPPORTED_API_TYPES.chromeProofreaderApi]:
    'proofreader-api-for-gemini-nano',
};

export const CHROME_BUILT_IN_AI_API_NAMES = {
  [UNSUPPORTED_API_TYPES.chromeLanguageDetectorApi]: 'Language Detector',
  [UNSUPPORTED_API_TYPES.chromePromptApi]: 'Gemini Nano',
  [UNSUPPORTED_API_TYPES.chromeRewriter]: 'Rewriter',
  [UNSUPPORTED_API_TYPES.chromeSummarizerApi]: 'Summarizer',
  [UNSUPPORTED_API_TYPES.chromeTranslatorApi]: 'Translator',
  [UNSUPPORTED_API_TYPES.chromeWriter]: 'Writer',
  [UNSUPPORTED_API_TYPES.chromeProofreaderApi]: 'Proofreader',
};

export type UnsupportedApiType =
  (typeof UNSUPPORTED_API_TYPES)[keyof typeof UNSUPPORTED_API_TYPES];
