'use client';

import { PhotoIcon, RocketLaunchIcon } from '@heroicons/react/20/solid';
import ToolsSelectorMobile from './components/mobile';
import ToolsSelectorDesktop from './components/desktop';

export const Tools = [
  {
    name: 'Image Tools',
    items: [
      {
        name: 'Base64 to Image',
        href: '/tools/image-tool/base64-to-image',
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
        icon: {
          component: RocketLaunchIcon,
        },
      },
    ],
  },
];

export { ToolsSelectorMobile, ToolsSelectorDesktop };
