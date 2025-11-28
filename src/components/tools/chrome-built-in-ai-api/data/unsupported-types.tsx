export const UnsupportedApiTypes = {
  chromeBuiltInAiApi: 'chrome-built-in-ai-api',
  chromeLanguageDetectorApi: 'chrome-language-detector-api',
  chromePromptApi: 'chrome-prompt-api',
  chromeRewriter: 'chrome-rewriter',
  chromeSummarizerApi: 'chrome-summarizer-api',
  chromeTranslatorApi: 'chrome-translator-api',
  chromeWriter: 'chrome-writer',
};

export const ChromeBuiltInAiApiFlags = {
  [UnsupportedApiTypes.chromeLanguageDetectorApi]: 'language-detection-api',
  [UnsupportedApiTypes.chromePromptApi]: 'prompt-api-for-gemini-nano',
  [UnsupportedApiTypes.chromeRewriter]: 'rewriter-api-for-gemini-nano',
  [UnsupportedApiTypes.chromeSummarizerApi]:
    'summarization-api-for-gemini-nano',
  [UnsupportedApiTypes.chromeTranslatorApi]: 'translation-api',
  [UnsupportedApiTypes.chromeWriter]: 'writer-api-for-gemini-nano',
};

export const ChromeBuiltInAiApiNames = {
  [UnsupportedApiTypes.chromeLanguageDetectorApi]: 'Language Detector',
  [UnsupportedApiTypes.chromePromptApi]: 'Gemini Nano',
  [UnsupportedApiTypes.chromeRewriter]: 'Rewriter',
  [UnsupportedApiTypes.chromeSummarizerApi]: 'Summarizer',
  [UnsupportedApiTypes.chromeTranslatorApi]: 'Translator',
  [UnsupportedApiTypes.chromeWriter]: 'Writer',
};

export type UnsupportedApiType =
  (typeof UnsupportedApiTypes)[keyof typeof UnsupportedApiTypes];
