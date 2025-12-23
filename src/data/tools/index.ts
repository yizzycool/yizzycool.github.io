/**
 * Keep this file as a Server Component because it is imported by @/src/app/sitemap.ts,
 * and only Server Components can be imported in that context.
 */
import _fromPairs from 'lodash/fromPairs';
import _findKey from 'lodash/findKey';

import {
  ArrowLeftRight,
  Bot,
  CaseUpper,
  Clock,
  CodeXml,
  FileImage,
  FileText,
  Image,
  Languages,
  PenTool,
  QrCode,
  Radar,
  RefreshCcw,
  Regex,
  ScanFace,
} from 'lucide-react';

// Tool Groups

export const ToolGroupKeys = {
  devTool: 'devTool',
  imgTool: 'imgTool',
  chromeAiApi: 'chromeAiApi',
  webDetectorApi: 'webDetectorApi',
};

export const ToolGroupKeysOrder = [
  ToolGroupKeys.devTool,
  ToolGroupKeys.imgTool,
  ToolGroupKeys.chromeAiApi,
  ToolGroupKeys.webDetectorApi,
];

export const ToolGroupNames = {
  [ToolGroupKeys.devTool]: 'Developer Tools',
  [ToolGroupKeys.imgTool]: 'Image Tools',
  [ToolGroupKeys.chromeAiApi]: 'Chrome AI APIs',
  [ToolGroupKeys.webDetectorApi]: 'Web Detector APIs',
};

export const ToolGroupSlugs = {
  [ToolGroupKeys.devTool]: 'dev-tool',
  [ToolGroupKeys.imgTool]: 'image-tool',
  [ToolGroupKeys.chromeAiApi]: 'chrome-built-in-ai-api',
  [ToolGroupKeys.webDetectorApi]: 'web-detection-api',
};

// Tools

export const ToolKeys = {
  urlEncoderDecoder: 'urlEncoderDecoder',
  jsonFormatter: 'jsonFormatter',
  unixTimestampConverter: 'unixTimestampConverter',
  regexTester: 'regexTester',

  base64ToImage: 'base64ToImage',
  imageToBase64: 'imageToBase64',

  chromeAiTranslator: 'chromeAiTranslator',
  chromeAiLanguageDetector: 'chromeAiLanguageDetector',
  chromeAiSummarizer: 'chromeAiSummarizer',
  chromeAiWriter: 'chromeAiWriter',
  chromeAiRewriter: 'chromeAiRewriter',
  chromeAiPrompt: 'chromeAiPrompt',

  chromeFaceDetector: 'chromeFaceDetector',
  chromeBarcodeDetector: 'chromeBarcodeDetector',
  chromeTextDetector: 'chromeTextDetector',
};

export const ToolGroupItems = {
  [ToolGroupKeys.devTool]: [
    ToolKeys.urlEncoderDecoder,
    ToolKeys.jsonFormatter,
    ToolKeys.unixTimestampConverter,
    ToolKeys.regexTester,
  ],
  [ToolGroupKeys.imgTool]: [ToolKeys.base64ToImage, ToolKeys.imageToBase64],
  [ToolGroupKeys.chromeAiApi]: [
    ToolKeys.chromeAiTranslator,
    ToolKeys.chromeAiLanguageDetector,
    ToolKeys.chromeAiSummarizer,
    ToolKeys.chromeAiWriter,
    ToolKeys.chromeAiRewriter,
    ToolKeys.chromeAiPrompt,
  ],
  [ToolGroupKeys.webDetectorApi]: [
    ToolKeys.chromeFaceDetector,
    ToolKeys.chromeBarcodeDetector,
    ToolKeys.chromeTextDetector,
  ],
};

export const ToolTitles = {
  [ToolKeys.urlEncoderDecoder]: 'URL Encoder / Decoder',
  [ToolKeys.jsonFormatter]: 'JSON Formatter',
  [ToolKeys.unixTimestampConverter]: 'Unix Timestamp Converter',
  [ToolKeys.regexTester]: 'Regular Expression Tester',

  [ToolKeys.base64ToImage]: 'Base64 to Image',
  [ToolKeys.imageToBase64]: 'Image to Base64',

  [ToolKeys.chromeAiTranslator]: 'AI Translator',
  [ToolKeys.chromeAiLanguageDetector]: 'AI Language Detector',
  [ToolKeys.chromeAiSummarizer]: 'AI Summarizer',
  [ToolKeys.chromeAiWriter]: 'AI Writer',
  [ToolKeys.chromeAiRewriter]: 'AI Rewriter',
  [ToolKeys.chromeAiPrompt]: 'AI Chat',

  [ToolKeys.chromeFaceDetector]: 'Face Detector',
  [ToolKeys.chromeBarcodeDetector]: 'Barcode Detector',
  [ToolKeys.chromeTextDetector]: 'Text Detector',
};

export const ToolDescriptions = {
  [ToolKeys.urlEncoderDecoder]:
    'Quickly encode or decode URLs and text to prevent errors and ensure safe, reliable data transmission across the web.',
  [ToolKeys.jsonFormatter]:
    'Format JSON for readability or minify it for compact output. Instantly prettify or compress JSON with this free online tool.',
  [ToolKeys.unixTimestampConverter]:
    'Convert Unix timestamps to human-readable dates and convert date/time back to Unix timestamps instantly.',
  [ToolKeys.regexTester]:
    'Test and debug regular expressions in real time with instant match highlighting and group inspection.',

  [ToolKeys.base64ToImage]:
    'Instantly convert Base64 strings back into images, supporting multiple formats for fast preview and verification.',
  [ToolKeys.imageToBase64]:
    'Upload any image and convert it into a Base64 string — perfect for frontend development, API testing, and embedding assets in HTML.',

  [ToolKeys.chromeAiTranslator]:
    'Translate text instantly using Chrome’s built-in Gemini AI, offering fast, accurate, and setup-free multilingual translation.',
  [ToolKeys.chromeAiLanguageDetector]:
    'Automatically detect the language of any text with Chrome’s built-in AI, ideal for multilingual applications and text analysis.',
  [ToolKeys.chromeAiSummarizer]:
    'Generate concise summaries from long text using Chrome’s built-in AI, helping you capture key ideas and save reading time.',
  [ToolKeys.chromeAiWriter]:
    'Create natural, high-quality content with Chrome’s built-in AI, including paragraphs, articles, marketing copy, and more.',
  [ToolKeys.chromeAiRewriter]:
    'Rewrite and enhance existing text using Chrome’s built-in AI to improve clarity, tone, flow, and readability while preserving meaning.',
  [ToolKeys.chromeAiPrompt]:
    'Run AI prompts directly through Chrome’s built-in models, enabling fast, local AI inference with minimal setup for developers.',

  [ToolKeys.chromeFaceDetector]:
    'Detect faces in images instantly using Chrome’s built-in face detection API—ideal for camera apps, interactive features, and security ToolKeys.',
  [ToolKeys.chromeBarcodeDetector]:
    'Quickly scan and decode QR codes and various barcode formats with Chrome’s built-in barcode detection API.',
  [ToolKeys.chromeTextDetector]:
    'Extract text from images with Chrome’s built-in text detection API, supporting OCR tasks, data extraction, and automation workflows.',
};

export const ToolSlugs = {
  [ToolKeys.urlEncoderDecoder]: 'url-encoder-decoder',
  [ToolKeys.jsonFormatter]: 'json-formatter',
  [ToolKeys.unixTimestampConverter]: 'unix-timestamp-converter',
  [ToolKeys.regexTester]: 'regex-tester',

  [ToolKeys.base64ToImage]: 'base64-to-image',
  [ToolKeys.imageToBase64]: 'image-to-base64',

  [ToolKeys.chromeAiTranslator]: 'translator',
  [ToolKeys.chromeAiLanguageDetector]: 'language-detector',
  [ToolKeys.chromeAiSummarizer]: 'summarizer',
  [ToolKeys.chromeAiWriter]: 'writer',
  [ToolKeys.chromeAiRewriter]: 'rewriter',
  [ToolKeys.chromeAiPrompt]: 'prompt',

  [ToolKeys.chromeFaceDetector]: 'face-detector',
  [ToolKeys.chromeBarcodeDetector]: 'barcode-detector',
  [ToolKeys.chromeTextDetector]: 'text-detector',
};

export const ToolUrls = _fromPairs(
  Object.values(ToolKeys).map((toolKey) => {
    const toolGroupKey = _findKey(ToolGroupItems, (value) =>
      value.includes(toolKey)
    ) as string;
    return [
      toolKey,
      `/tools/${ToolGroupSlugs[toolGroupKey]}/${ToolSlugs[toolKey]}`,
    ];
  })
);

export const ToolIcons = {
  [ToolKeys.urlEncoderDecoder]: ArrowLeftRight,
  [ToolKeys.jsonFormatter]: CodeXml,
  [ToolKeys.unixTimestampConverter]: Clock,
  [ToolKeys.regexTester]: Regex,

  [ToolKeys.base64ToImage]: FileImage,
  [ToolKeys.imageToBase64]: Image,

  [ToolKeys.chromeAiTranslator]: Languages,
  [ToolKeys.chromeAiLanguageDetector]: Radar,
  [ToolKeys.chromeAiSummarizer]: FileText,
  [ToolKeys.chromeAiWriter]: PenTool,
  [ToolKeys.chromeAiRewriter]: RefreshCcw,
  [ToolKeys.chromeAiPrompt]: Bot,

  [ToolKeys.chromeFaceDetector]: ScanFace,
  [ToolKeys.chromeBarcodeDetector]: QrCode,
  [ToolKeys.chromeTextDetector]: CaseUpper,
};

// Tools Data
export const Tools = ToolGroupKeysOrder.map((groupKey) => ({
  name: ToolGroupNames[groupKey],
  items: ToolGroupItems[groupKey].map((toolKey) => ({
    name: ToolTitles[toolKey],
    href: ToolUrls[toolKey],
    desc: ToolDescriptions[toolKey],
    icon: {
      component: ToolIcons[toolKey],
    },
  })),
}));
