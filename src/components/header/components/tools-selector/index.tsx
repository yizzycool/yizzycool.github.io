'use client';

import { Bot, FileText, Image, Languages, Radar } from 'lucide-react';
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
        name: 'Gemini Nano (Prompt API)',
        href: '/tools/chrome-built-in-ai-api/prompt',
        desc: 'Enables AI-powered text generation and understanding for web apps.',
        icon: {
          component: Bot,
        },
      },
    ],
  },
];

export { ToolsSelectorMobile, ToolsSelectorDesktop };
