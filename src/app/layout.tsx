import '@/styles/globals.css';
import urlJoin from 'url-join';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

import seoUtils from '@/utils/seo-utils';
import Header from '@/components/header';
import Footer from '@/components/footer';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '/';
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {!!gtmId && (
          <Script id="gtm" strategy="lazyOnload">
            {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
          </Script>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoUtils.generateWebSiteJsonLd()),
          }}
        />
      </head>
      <body className="overflow-x-hidden bg-gray-50 text-neutral-700 antialiased dark:bg-neutral-900 dark:text-neutral-300">
        {!!gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            ></iframe>
          </noscript>
        )}
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
