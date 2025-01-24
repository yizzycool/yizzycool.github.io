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
      <body className="bg-white text-neutral-700 antialiased dark:bg-neutral-900 dark:text-neutral-300">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
