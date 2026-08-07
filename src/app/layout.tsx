import type { Metadata, Viewport } from 'next';

import '@/styles/globals.css';
import urlJoin from 'url-join';
import { Inter, Noto_Sans_TC } from 'next/font/google';

import { DEFAULT_DOMAIN } from '@/data/global';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { GTMNoScript, GTMScript } from '@/components/layout/gtm';

const domain = process.env.NEXT_PUBLIC_DOMAIN || DEFAULT_DOMAIN;

const meta = {
  title: 'Yizzy Peasy - Frontend & Web Development Blog',
  description:
    'Focused on programming and frontend development, sharing technical articles and useful tools to help developers improve their skills and efficiency. Explore JavaScript, React, Next.js, TypeScript, and the latest frontend technologies!',
  keywords: [
    'Next.js',
    'React',
    'JavaScript',
    'Frontend',
    'Programming',
    'Useful Tools',
  ],
  og: {
    siteName: 'Yizzy Peasy',
    description:
      'Focused on frontend development & JavaScript/React. Sharing tech articles and useful tools to boost developer productivity and skills!',
    image: {
      url: urlJoin(domain, '/assets/images/home/og-image.jpg'),
      width: 1200,
      height: 630,
      alt: 'Banner image',
    },
    locale: 'en_US',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  metadataBase: new URL(
    domain.startsWith('http') ? domain : `https://${domain}`
  ),
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  authors: [{ name: 'Yizzy Wu', url: domain }],
  alternates: {
    canonical: domain,
  },
  openGraph: {
    title: meta.title,
    description: meta.og.description,
    url: domain,
    siteName: meta.og.siteName,
    images: [meta.og.image],
    locale: meta.og.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.og.description,
    images: [meta.og.image.url],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: meta.og.siteName,
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansTC = Noto_Sans_TC({
  preload: false,
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansTC.variable}`}
    >
      <head>
        <GTMScript />
      </head>
      <body className="overflow-x-hidden bg-gray-50 text-slate-500 antialiased dark:bg-neutral-900 dark:text-slate-400">
        <GTMNoScript />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
