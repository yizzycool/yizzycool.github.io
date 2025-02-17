'use client';

import {
  DocumentTextIcon,
  LanguageIcon,
  PhotoIcon,
  SparklesIcon,
} from '@heroicons/react/20/solid';
import ToolsSelectorMobile from './components/mobile';
import ToolsSelectorDesktop from './components/desktop';

export const Tools = [
  {
    name: 'Image Tools',
    items: [
      {
        name: 'Base64 to Image',
        href: '/tools/image-tool/base64-to-image',
        desc: '',
        icon: {
          component: PhotoIcon,
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
          component: LanguageIcon,
        },
      },
      {
        name: 'Language Detector',
        href: '/tools/chrome-built-in-ai-api/language-detector',
        desc: 'Enables AI-powered language detection for web apps.',
        icon: {
          component: SparklesIcon,
        },
      },
      {
        name: 'Summarizer',
        href: '/tools/chrome-built-in-ai-api/summarizer',
        desc: 'Enables AI-powered text summarization for web apps.',
        icon: {
          component: DocumentTextIcon,
        },
      },
    ],
  },
];

export { ToolsSelectorMobile, ToolsSelectorDesktop };
