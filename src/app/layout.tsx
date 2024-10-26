import type { Metadata } from 'next';
import '@/styles/globals.css';
import 'animate.css';
import { Roboto } from 'next/font/google';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import MuiThemeProvider from '@/components/mui/theme-provider';
import Header from '@/components/header';

const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

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
      <body className={roboto.className}>
        <InitColorSchemeScript attribute="data" />
        <MuiThemeProvider>
          <Header />
          {children}
        </MuiThemeProvider>
      </body>
    </html>
  );
}
