import type { Metadata } from 'next';

import '@/styles/globals.css';
import urlJoin from 'url-join';
import { Inter, Noto_Sans_TC } from 'next/font/google';

import seoUtils from '@/utils/seo-utils';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { GTMNoScript, GTMScript } from '@/components/layout/gtm';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '/';

export const metadata: Metadata = {
  title: 'Yizzy Peasy | Coding Life',
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
  authors: [{ name: 'Yizzy Wu', url: domain }],
  openGraph: {
    title: 'Yizzy Peasy | Coding Life',
    description:
      'Focused on programming and frontend development, sharing technical articles and useful tools to help developers improve their skills and efficiency. Explore JavaScript, React, Next.js, TypeScript, and the latest frontend technologies!',
    url: domain,
    siteName: 'Yizzy Peasy',
    images: [
      {
        url: urlJoin(domain, '/assets/images/home/avatar.jpg'),
        width: 600,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoUtils.generateWebSiteJsonLd()),
          }}
        />
      </head>
      <body className="overflow-x-hidden bg-gray-50 text-neutral-700 antialiased dark:bg-neutral-900 dark:text-neutral-300">
        <GTMNoScript />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
