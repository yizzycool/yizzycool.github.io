import type { Config } from 'tailwindcss';

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      keyframes: {
        'flash-cursor': {
          '0%, 25%, 75%, 100%': {
            opacity: '1',
          },
          '30%, 70%': {
            opacity: '0',
          },
        },
        'slightly-fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translate3d(0, -10%, 0)',
          },
          '100%': {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
        },
        'slightly-fade-out-up': {
          '0%': {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translate3d(0, -10%, 0)',
          },
        },
      },
      animation: {
        'flash-cursor': '1s flash-cursor infinite',
        'slightly-fade-in-down': '1s slightly-fade-in-down',
        'slightly-fade-out-up': '1s slightly-fade-out-up',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        serif: [
          'Inter',
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif',
        ],
        mono: [
          'Inter',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
  darkMode: [
    'variant',
    [
      '@media (prefers-color-scheme: dark) { &:not(.light *) }',
      '&:is(.dark *)',
    ],
  ],
} satisfies Config;
