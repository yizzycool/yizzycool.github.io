import type {
  ColorSpaceItemData,
  ColorSpaceValues,
  NormalizedRgba,
} from './types';

/** Default starter color: Tailwind Blue 500 */
export const DEFAULT_COLOR = '#3B82F6';

/** Normalized RGBA for default color */
export const DEFAULT_RGBA: NormalizedRgba = {
  r: 59,
  g: 130,
  b: 246,
  a: 1,
};

/** Metadata schema for color spaces display */
export function buildColorSpaceList(
  values: ColorSpaceValues
): ColorSpaceItemData[] {
  return [
    {
      id: 'hex',
      label: 'HEX',
      value: values.hex,
      subText: 'Standard 6-digit hexadecimal color notation for CSS and HTML.',
    },
    {
      id: 'hex8',
      label: 'HEX8',
      value: values.hex8,
      subText:
        '8-digit hexadecimal color notation with alpha transparency channel.',
    },
    {
      id: 'rgb',
      label: 'RGB',
      value: values.rgb,
      subText: 'Red, green, and blue primary color channels (0..255).',
    },
    {
      id: 'rgba',
      label: 'RGBA',
      value: values.rgba,
      subText: 'RGB format with alpha opacity channel (0..1).',
    },
    {
      id: 'hsl',
      label: 'HSL',
      value: values.hsl,
      subText: 'Hue (0..360°), saturation (0..100%), and lightness (0..100%).',
    },
    {
      id: 'hsla',
      label: 'HSLA',
      value: values.hsla,
      subText: 'HSL format with alpha opacity channel (0..1).',
    },
    {
      id: 'hsv',
      label: 'HSV / HSB',
      value: values.hsv,
      subText:
        'Hue, saturation, and brightness widely used in Figma and Photoshop.',
    },
    {
      id: 'cmyk',
      label: 'CMYK',
      value: values.cmyk,
      subText:
        'Cyan, magenta, yellow, and black ink separation for four-color printing.',
    },
    {
      id: 'oklch',
      label: 'OKLCH',
      value: values.oklch,
      subText: 'Modern CSS Color 4 perceptually uniform color space.',
    },
    {
      id: 'lab',
      label: 'CIE LAB',
      value: values.lab,
      subText:
        'Device-independent absolute color space based on human visual perception.',
    },
  ];
}
