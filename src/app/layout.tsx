import type { Metadata } from 'next';
import '@/styles/globals.css';
import 'animate.css';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'Yizzy Peasy | Coding Life',
  description: 'Frontend Engineer',
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
      </head>
      <body className="bg-white text-neutral-700 antialiased dark:bg-neutral-900 dark:text-neutral-300">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
