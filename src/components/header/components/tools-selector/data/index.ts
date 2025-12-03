/**
 * Keep this file as a Server Component because it is imported by @/src/app/sitemap.ts,
 * and only Server Components can be imported in that context.
 */

import {
  ArrowLeftRight,
  Bot,
  CaseUpper,
  FileText,
  Image,
  Languages,
  PenTool,
  QrCode,
  Radar,
  RefreshCcw,
  ScanFace,
} from 'lucide-react';

export const Tools = [
  {
    name: 'Developer Tools',
    items: [
      {
        name: 'URL Encoder & Decoder',
        href: '/tools/dev-tool/url-encoder-decoder',
        desc: '',
        icon: {
          component: ArrowLeftRight,
        },
      },
    ],
  },
  {
    name: 'Image Tools',
    items: [
      {
        name: 'Base64 to Image',
        href: '/tools/image-tool/base64-to-image',
        desc: '',
        icon: {
          component: Image,
        },
      },
      {
        name: 'Image to Base64',
        href: '/tools/image-tool/image-to-base64',
        desc: '',
        icon: {
          component: Image,
        },
      },
    ],
  },
  {
    name: 'Chrome AI APIs',
    items: [
      {
        name: 'Translator',
        href: '/tools/chrome-built-in-ai-api/translator',
        desc: 'Enables AI-powered text translation for web apps.',
        icon: {
          component: Languages,
        },
      },
      {
        name: 'Language Detector',
        href: '/tools/chrome-built-in-ai-api/language-detector',
        desc: 'Enables AI-powered language detection for web apps.',
        icon: {
          component: Radar,
        },
      },
      {
        name: 'Summarizer',
        href: '/tools/chrome-built-in-ai-api/summarizer',
        desc: 'Enables AI-powered text summarization for web apps.',
        icon: {
          component: FileText,
        },
      },
      {
        name: 'Writer',
        href: '/tools/chrome-built-in-ai-api/writer',
        desc: 'Enables AI-powered content creation for web apps.',
        icon: {
          component: PenTool,
        },
      },
      {
        name: 'Rewriter',
        href: '/tools/chrome-built-in-ai-api/rewriter',
        desc: 'Enables AI-driven text revision for web apps.',
        icon: {
          component: RefreshCcw,
        },
      },
      {
        name: 'Gemini Nano (Prompt API)',
        href: '/tools/chrome-built-in-ai-api/prompt',
        desc: 'Enables AI-powered text generation and understanding for web apps.',
        icon: {
          component: Bot,
        },
      },
    ],
  },
  {
    name: 'Chrome Detector APIs',
    items: [
      {
        name: 'Face Detector',
        href: '/tools/web-detection-api/face-detector',
        desc: 'Detect faces in real-time using Chrome’s built-in API.',
        icon: {
          component: ScanFace,
        },
      },
      {
        name: 'Barcode Detector',
        href: '/tools/web-detection-api/barcode-detector',
        desc: 'Detect barcodes in real-time using Chrome’s built-in API.',
        icon: {
          component: QrCode,
        },
      },
      {
        name: 'Text Detector',
        href: '/tools/web-detection-api/text-detector',
        desc: 'Detect texts in real-time using Chrome’s built-in API.',
        icon: {
          component: CaseUpper,
        },
      },
    ],
  },
];
