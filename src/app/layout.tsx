import type { Metadata } from 'next';
import '@/styles/globals.css';
import 'animate.css';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import MuiThemeProvider from '@/components/mui/theme-provider';
import Header from '@/components/header';

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
      <body>
        <InitColorSchemeScript attribute="data" />
        <MuiThemeProvider>
          <Header />
          {children}
        </MuiThemeProvider>
      </body>
    </html>
  );
}
