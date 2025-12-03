'use client';

import { usePathname } from 'next/navigation';
import _get from 'lodash/get';

const tools = {
  urlEncoderDecoder: '/tools/dev-tool/url-encoder-decoder',
  base64ToImage: '/tools/image-tool/base64-to-image',
  imageToBase64: '/tools/image-tool/image-to-base64',
  chromeAiTranslator: '/tools/chrome-built-in-ai-api/translator',
  chromeAiLanguageDetector: '/tools/chrome-built-in-ai-api/language-detector',
  chromeAiSummarizer: '/tools/chrome-built-in-ai-api/summarizer',
  chromeAiWriter: '/tools/chrome-built-in-ai-api/writer',
  chromeAiRewriter: '/tools/chrome-built-in-ai-api/rewriter',
  chromeAiPrompt: '/tools/chrome-built-in-ai-api/prompt',
  chromeFaceDetector: '/tools/web-detection-api/face-detector',
  chromeBarcodeDetector: '/tools/web-detection-api/barcode-detector',
  chromeTextDetector: '/tools/web-detection-api/text-detector',
};

const titles = {
  [tools.urlEncoderDecoder]: 'URL Encoder / Decoder',
  [tools.base64ToImage]: 'Base64 to Image',
  [tools.imageToBase64]: 'Image to Base64',
  [tools.chromeAiTranslator]: 'AI Translator',
  [tools.chromeAiLanguageDetector]: 'AI Language Detector',
  [tools.chromeAiSummarizer]: 'AI Summarizer',
  [tools.chromeAiWriter]: 'AI Writer',
  [tools.chromeAiRewriter]: 'AI Rewriter',
  [tools.chromeAiPrompt]: 'AI Chat',
  [tools.chromeFaceDetector]: 'Face Detector',
  [tools.chromeBarcodeDetector]: 'Barcode Detector',
  [tools.chromeTextDetector]: 'Text Detector',
};

const descriptions = {
  [tools.urlEncoderDecoder]:
    'Quickly encode or decode URLs and text to prevent errors and ensure safe, reliable data transmission across the web.',
  [tools.base64ToImage]:
    'Instantly convert Base64 strings back into images, supporting multiple formats for fast preview and verification.',
  [tools.imageToBase64]:
    'Upload any image and convert it into a Base64 string — perfect for frontend development, API testing, and embedding assets in HTML.',
  [tools.chromeAiTranslator]:
    'Translate text instantly using Chrome’s built-in Gemini AI, offering fast, accurate, and setup-free multilingual translation.',
  [tools.chromeAiLanguageDetector]:
    'Automatically detect the language of any text with Chrome’s built-in AI, ideal for multilingual applications and text analysis.',
  [tools.chromeAiSummarizer]:
    'Generate concise summaries from long text using Chrome’s built-in AI, helping you capture key ideas and save reading time.',
  [tools.chromeAiWriter]:
    'Create natural, high-quality content with Chrome’s built-in AI, including paragraphs, articles, marketing copy, and more.',
  [tools.chromeAiRewriter]:
    'Rewrite and enhance existing text using Chrome’s built-in AI to improve clarity, tone, flow, and readability while preserving meaning.',
  [tools.chromeAiPrompt]:
    'Run AI prompts directly through Chrome’s built-in models.',
  [tools.chromeFaceDetector]:
    'Detect faces in images instantly using Chrome’s built-in face detection API—ideal for camera apps, interactive features, and security tools.',
  [tools.chromeBarcodeDetector]:
    'Quickly scan and decode QR codes and various barcode formats with Chrome’s built-in barcode detection API.',
  [tools.chromeTextDetector]:
    'Extract text from images with Chrome’s built-in text detection API, supporting OCR tasks, data extraction, and automation workflows.',
};

export default function HeaderBlock() {
  const pathname = usePathname();

  return (
    <header>
      <h1 className="text-left text-2xl font-bold">
        {_get(titles, pathname, '')}
      </h1>
      <h2 className="mt-4 text-left text-sm text-gray-500 md:text-base dark:text-neutral-400">
        {_get(descriptions, pathname, '')}
      </h2>
    </header>
  );
}
