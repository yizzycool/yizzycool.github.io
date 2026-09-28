import {
  Fira_Mono,
  Inter,
  Merriweather,
  Noto_Sans_TC,
  Noto_Serif_TC,
} from 'next/font/google';

// Sans-Serif
export const inter = Inter({
  variable: '--font-inter',
  display: 'swap',
  subsets: ['latin'],
});

// Sans-Serif for Traditional Chinese
export const notoSansTC = Noto_Sans_TC({
  preload: false,
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

// Serif
export const merriweather = Merriweather({
  preload: false,
  variable: '--font-merriweather',
  display: 'swap',
  subsets: ['latin'],
});

// Serif for Chinese
export const notoSerifTC = Noto_Serif_TC({
  preload: false,
  variable: '--font-noto-serif-tc',
  display: 'swap',
});

// Mono
export const firaMono = Fira_Mono({
  preload: false,
  variable: '--font-fira-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});
