export declare module '@mui/material/styles' {
  interface Palette {
    header: Palette['primary'];
  }
  interface PaletteOptions {
    header?: PaletteOptions['primary'];
  }
}

export declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides {
    header: true;
  }
}
