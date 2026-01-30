type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

const DefaultRGBA = { r: 255, g: 255, b: 255, a: 1.0 };

const DefaultColorOpacity = {
  color: '',
  opacity: 1,
};

const colorUtils = {
  hexToRgba: (hex: string): RGBA => {
    if (!hex.startsWith('#')) return DefaultRGBA;
    if (hex.length !== 7 && hex.length !== 9) return DefaultRGBA;

    const parseHex = (value: string): number => Number.parseInt(value, 16);

    const r = parseHex(hex.slice(1, 3));
    const g = parseHex(hex.slice(3, 5));
    const b = parseHex(hex.slice(5, 7));

    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return DefaultRGBA;
    }

    // #RRGGBB
    if (hex.length === 7) {
      return { r, g, b, a: 1 };
    }

    // #RRGGBBAA
    const aHex = parseHex(hex.slice(7, 9));
    if (Number.isNaN(aHex)) return DefaultRGBA;

    return {
      r,
      g,
      b,
      a: +(aHex / 255).toFixed(4),
    };
  },

  rgbaToHex: (rgba: RGBA): string => {
    const { r, g, b, a } = rgba;

    const isByte = (v: number) => Number.isInteger(v) && v >= 0 && v <= 255;

    const isAlpha = (v: number) => typeof v === 'number' && v >= 0 && v <= 1;

    if (!isByte(r) || !isByte(g) || !isByte(b) || !isAlpha(a)) {
      return '';
    }

    const toHex = (v: number) => v.toString(16).padStart(2, '0');

    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    if (a === 1) {
      return hex;
    }

    const alphaHex = Math.round(a * 255)
      .toString(16)
      .padStart(2, '0');

    return `${hex}${alphaHex}`;
  },

  hexToColorOpacity: (hex: string) => {
    if (!hex.startsWith('#')) return DefaultColorOpacity;
    if (hex.length !== 7 && hex.length !== 9) return DefaultColorOpacity;

    const rgbHex = hex.slice(0, 7);
    const opacity = hex.length === 7 ? 1 : Number.parseInt(hex.slice(7, 9), 16);

    return {
      color: rgbHex,
      opacity,
    };
  },
};

export default colorUtils;
