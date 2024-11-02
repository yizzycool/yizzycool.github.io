import type { Metadata } from 'next';
import '@/styles/globals.css';
import '@/styles/keyframes.css';
import 'animate.css';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import MUIStyledEngineProvider from '@/components/mui/styled-engine-provider';
import MuiThemeProvider from '@/components/mui/theme-provider';
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
      <body>
        <InitColorSchemeScript attribute="data" />
        <MUIStyledEngineProvider>
          <MuiThemeProvider>
            <Header />
            {children}
            <Footer />
          </MuiThemeProvider>
        </MUIStyledEngineProvider>
      </body>
    </html>
  );
}
