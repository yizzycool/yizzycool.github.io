'use client';

import type {} from '@mui/lab/themeAugmentation';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Poppins } from 'next/font/google';

const poppin = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

export default function MuiThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = createTheme({
    cssVariables: {
      colorSchemeSelector: 'data',
    },
    colorSchemes: {
      dark: true,
    },
    palette: {
      primary: {
        main: grey[50],
      },
    },
    typography: {
      fontFamily: [
        poppin.style.fontFamily,
        '-apple-system',
        '"Helvetica"',
        '"Arial"',
        'sans-serif',
      ].join(','),
    },
  });

  return (
    <ThemeProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
