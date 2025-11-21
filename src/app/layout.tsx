import type { Metadata } from 'next';
import '@/styles/globals.css';
import Script from 'next/script';
import Header from '@/components/header';
import Footer from '@/components/footer';

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
  authors: [{ name: 'Yizzy Wu', url: 'https://yizzycool.github.io' }],
  openGraph: {
    title: 'Yizzy Peasy | Coding Life',
    description:
      'Focused on programming and frontend development, sharing technical articles and useful tools to help developers improve their skills and efficiency. Explore JavaScript, React, Next.js, TypeScript, and the latest frontend technologies!',
    url: 'https://yizzycool.github.io',
    siteName: 'Yizzy Peasy',
    images: [
      {
        url: 'https://yizzycool.github.io/assets/images/home/avatar.jpg',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <Script id="gtm" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TVFKTXLV');
          `}
        </Script>
      </head>
      <body className="overflow-x-hidden bg-gray-50 text-neutral-700 antialiased dark:bg-neutral-900 dark:text-neutral-300">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TVFKTXLV"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
