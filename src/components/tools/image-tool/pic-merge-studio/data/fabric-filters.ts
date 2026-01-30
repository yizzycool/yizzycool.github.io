import type { FabricFilterConfig } from '../types/fabric-filter';
import * as fabric from 'fabric';

export const FabricFilterList = [
  fabric.filters.BlackWhite,
  fabric.filters.BlendColor,
  // fabric.filters.BlendImage,
  fabric.filters.Blur,
  fabric.filters.Brightness,
  fabric.filters.Brownie,
  // fabric.filters.ColorMatrix,
  // fabric.filters.Composed,
  fabric.filters.Contrast,
  // fabric.filters.Convolute,
  fabric.filters.Gamma,
  fabric.filters.Grayscale,
  // fabric.filters.HueRotation,
  fabric.filters.Invert,
  fabric.filters.Kodachrome,
  fabric.filters.Noise,
  fabric.filters.Pixelate,
  fabric.filters.Polaroid,
  fabric.filters.RemoveColor,
  // fabric.filters.Resize,
  fabric.filters.Saturation,
  fabric.filters.Sepia,
  fabric.filters.Technicolor,
  fabric.filters.Vibrance,
  fabric.filters.Vintage,
];

export const FabricFilterTypeList = [
  fabric.filters.BlackWhite.type,
  fabric.filters.BlendColor.type,
  // fabric.filters.BlendImage.type,
  fabric.filters.Blur.type,
  fabric.filters.Brightness.type,
  fabric.filters.Brownie.type,
  // fabric.filters.ColorMatrix.type,
  // fabric.filters.Composed.type,
  fabric.filters.Contrast.type,
  // fabric.filters.Convolute.type,
  fabric.filters.Gamma.type,
  fabric.filters.Grayscale.type,
  // fabric.filters.HueRotation.type,
  fabric.filters.Invert.type,
  fabric.filters.Kodachrome.type,
  fabric.filters.Noise.type,
  fabric.filters.Pixelate.type,
  fabric.filters.Polaroid.type,
  fabric.filters.RemoveColor.type,
  // fabric.filters.Resize.type,
  fabric.filters.Saturation.type,
  fabric.filters.Sepia.type,
  fabric.filters.Technicolor.type,
  fabric.filters.Vibrance.type,
  fabric.filters.Vintage.type,
];

export const FabricFilterMap: FabricFilterConfig = {
  [fabric.filters.BlackWhite.type]: {
    filterType: 'fixed',
    filter: fabric.filters.BlackWhite,
  },
  [fabric.filters.BlendColor.type]: {
    filterType: '',
    filter: fabric.filters.BlendColor,
    params: {
      color: {
        type: 'rgb',
        default: '#F95C63',
      },
      mode: {
        type: 'choice',
        options: [
          'multiply',
          'add',
          'difference',
          'screen',
          'subtract',
          'darken',
          'lighten',
          'overlay',
          'exclusion',
          'tint',
        ],
        default: 'multiply',
      },
      alpha: {
        type: 'number',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        default: 1.0,
      },
    },
  },
  // [fabric.filters.BlendImage.type]: {
  //   filterType: '',
  //   filter: fabric.filters.BlendImage,
  // },
  [fabric.filters.Blur.type]: {
    filterType: '',
    filter: fabric.filters.Blur,
    params: {
      blur: {
        type: 'number',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        default: 0.1,
      },
    },
  },
  [fabric.filters.Brightness.type]: {
    filterType: '',
    filter: fabric.filters.Brightness,
    params: {
      brightness: {
        type: 'number',
        min: -1.0,
        max: 1.0,
        step: 0.01,
        default: 0.2,
      },
    },
  },
  [fabric.filters.Brownie.type]: {
    filterType: 'fixed',
    filter: fabric.filters.Brownie,
  },
  // [fabric.filters.ColorMatrix.type]: {
  //   filterType: '',
  //   filter: fabric.filters.ColorMatrix,
  // },
  // [fabric.filters.Composed.type]: {
  //   filterType: '',
  //   filter: fabric.filters.Composed,
  // },
  [fabric.filters.Contrast.type]: {
    filterType: '',
    filter: fabric.filters.Contrast,
    params: {
      contrast: {
        type: 'number',
        min: -1.0,
        max: 1.0,
        step: 0.01,
        default: 0.2,
      },
    },
  },
  // [fabric.filters.Convolute.type]: {
  //   filterType: '',
  //   filter: fabric.filters.Convolute,
  // },
  [fabric.filters.Gamma.type]: {
    filterType: '',
    filter: fabric.filters.Gamma,
    params: {
      gamma: {
        type: 'number-list',
        elements: [
          {
            type: 'number',
            min: 0.01,
            max: 2.2,
            step: 0.01,
            default: 1.2,
          },
          {
            type: 'number',
            min: 0.01,
            max: 2.2,
            step: 0.01,
            default: 1.2,
          },
          {
            type: 'number',
            min: 0.01,
            max: 2.2,
            step: 0.01,
            default: 2.2,
          },
        ],
        default: [1.2, 1.2, 2.2],
      },
    },
  },
  [fabric.filters.Grayscale.type]: {
    filterType: '',
    filter: fabric.filters.Grayscale,
    params: {
      mode: {
        type: 'choice',
        options: ['average', 'lightness', 'luminosity'],
        default: 'average',
      },
    },
  },
  // [fabric.filters.HueRotation.type]: {
  //   filterType: '',
  //   filter: fabric.filters.HueRotation,
  // },
  [fabric.filters.Invert.type]: {
    filterType: 'fixed',
    filter: fabric.filters.Invert,
  },
  [fabric.filters.Kodachrome.type]: {
    filterType: 'fixed',
    filter: fabric.filters.Kodachrome,
  },
  [fabric.filters.Noise.type]: {
    filterType: '',
    filter: fabric.filters.Noise,
    params: {
      noise: {
        type: 'number',
        min: 0,
        max: 1000,
        step: 1,
        default: 300,
      },
    },
  },
  [fabric.filters.Pixelate.type]: {
    filterType: '',
    filter: fabric.filters.Pixelate,
    params: {
      blocksize: {
        type: 'number',
        min: 0,
        max: 1000,
        step: 1,
        default: 20,
      },
    },
  },
  [fabric.filters.Polaroid.type]: {
    filterType: 'fixed',
    filter: fabric.filters.Polaroid,
  },
  [fabric.filters.RemoveColor.type]: {
    filterType: '',
    filter: fabric.filters.RemoveColor,
    params: {
      color: {
        type: 'rgb',
        default: '#FFFFFF',
      },
      distance: {
        type: 'number',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        default: 0.5,
      },
    },
  },
  // [fabric.filters.Resize.type]: {
  //   filterType: '',
  //   filter: fabric.filters.Resize,
  // },
  [fabric.filters.Saturation.type]: {
    filterType: '',
    filter: fabric.filters.Saturation,
    params: {
      saturation: {
        type: 'number',
        min: -1.0,
        max: 1.0,
        step: 0.01,
        default: 0.5,
      },
    },
  },
  [fabric.filters.Sepia.type]: {
    filterType: 'fixed',
    filter: fabric.filters.Sepia,
  },
  [fabric.filters.Technicolor.type]: {
    filterType: 'fixed',
    filter: fabric.filters.Technicolor,
  },
  [fabric.filters.Vibrance.type]: {
    filterType: '',
    filter: fabric.filters.Vibrance,
    params: {
      vibrance: {
        type: 'number',
        min: -1.0,
        max: 1.0,
        step: 0.01,
        default: 0.8,
      },
    },
  },
  [fabric.filters.Vintage.type]: {
    filterType: 'fixed',
    filter: fabric.filters.Vintage,
  },
};
