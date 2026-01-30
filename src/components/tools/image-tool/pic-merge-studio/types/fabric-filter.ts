import { FabricFilterList } from '../data/fabric-filters';

type FabricFilterColorParam = {
  type: string;
  default: string;
};

type FabricFilterSliderParam = {
  type: string;
  min: number;
  max: number;
  step: number;
  default: number;
};

type FabricFilterGammaParam = {
  type: string;
  elements: Array<FabricFilterSliderParam>;
  default: number[];
};

type FabricFilterSingleChoiceParam = {
  type: string;
  options: string[];
  default: string;
};

export type FabricFilterParams = {
  color?: FabricFilterColorParam;
  mode?: FabricFilterSingleChoiceParam;
  alpha?: FabricFilterSliderParam;
  blur?: FabricFilterSliderParam;
  brightness?: FabricFilterSliderParam;
  contrast?: FabricFilterSliderParam;
  gamma?: FabricFilterGammaParam;
  noise?: FabricFilterSliderParam;
  blocksize?: FabricFilterSliderParam;
  distance?: FabricFilterSliderParam;
  saturation?: FabricFilterSliderParam;
  vibrance?: FabricFilterSliderParam;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SupportedFabricFilterTypeList = [...FabricFilterList] as const;

export type SupportedFabricFilterType =
  (typeof SupportedFabricFilterTypeList)[number];

export type FabricFilterConfig = Record<
  string,
  {
    filterType: string;
    // filter: (typeof fabric.filters)[keyof typeof fabric.filters];
    filter: SupportedFabricFilterType;
    params?: FabricFilterParams;
  }
>;
