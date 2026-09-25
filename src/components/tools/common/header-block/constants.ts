import { ToolKeys } from '@/data/tools';

export const TOOLS_WITH_HISTORY = [
  ToolKeys.qrCodeGenerator,
  ToolKeys.jsonFormatter,
  ToolKeys.urlEncoderDecoder,
  ToolKeys.chromeAiPrompt,
];

export const TOOLS_WITH_HOTKEY = [
  ToolKeys.qrCodeGenerator,
  ToolKeys.wordCounter,
  ToolKeys.jsonFormatter,
  ToolKeys.keyCard,
  ToolKeys.urlEncoderDecoder,
  ToolKeys.unixTimestampConverter,
  ToolKeys.regexTester,
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
