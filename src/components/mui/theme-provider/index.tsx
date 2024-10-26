'use client';

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { blue, grey, indigo } from '@mui/material/colors';

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
  });

  return (
    <ThemeProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
