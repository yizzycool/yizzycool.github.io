import { ToolKeys } from '@/data/tools';

export const TOOLS_WITH_HISTORY = [
  ToolKeys.qrCodeGenerator,
  ToolKeys.jsonFormatter,
  ToolKeys.urlEncoderDecoder,
  ToolKeys.chromeAiPrompt,
];

export const TOOLS_WITH_HOTKEY = [
  // Everyday Life Tools
  ToolKeys.qrCodeGenerator,
  ToolKeys.wordCounter,
  ToolKeys.keyCard,

  // Developer Tools
  ToolKeys.urlEncoderDecoder,
  ToolKeys.jsonFormatter,
  ToolKeys.unixTimestampConverter,
  ToolKeys.regexTester,
  ToolKeys.hashGenerator,

  // Image Tools
  ToolKeys.picMergeStudio,

  // Chrome AI APIs
  ToolKeys.chromeAiPrompt,
  ToolKeys.chromeAiWriter,
  ToolKeys.chromeAiRewriter,
  ToolKeys.chromeAiSummarizer,
  ToolKeys.chromeAiProofreader,
  ToolKeys.chromeAiTranslator,
  ToolKeys.chromeAiLanguageDetector,

  // Web Detection APIs
  ToolKeys.chromeBarcodeDetector,
  ToolKeys.chromeFaceDetector,
  ToolKeys.chromeTextDetector,
];
