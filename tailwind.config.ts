import type { Config } from 'tailwindcss';
import tailwindcssAnimatePlugin from 'tailwindcss-animate';
import tailwindcssTypography from '@tailwindcss/typography';

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
        'pulse-glow': {
          '0%': { opacity: '0.3', transform: 'scale(0.98)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
          '100%': { opacity: '0.3', transform: 'scale(0.98)' },
        },
      },
      animation: {
        'flash-cursor': '1s flash-cursor infinite',
        'pulse-glow': '3s pulse-glow ease-in-out infinite',
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
  plugins: [tailwindcssAnimatePlugin, tailwindcssTypography],
  darkMode: [
    'variant',
    [
      '@media (prefers-color-scheme: dark) { &:not(.light *) }',
      '&:is(.dark *)',
    ],
  ],
} satisfies Config;
