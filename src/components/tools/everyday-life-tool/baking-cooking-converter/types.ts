import type { PropertyItem } from '@/components/tools/common/property-row';

export type ConverterMode = 'ingredients' | 'oven';

export type IngredientCategory =
  | 'all'
  | 'flours'
  | 'sugars'
  | 'dairy'
  | 'liquids'
  | 'pantry';

export type MeasurementUnit =
  | 'us_cup'
  | 'metric_cup'
  | 'tbsp'
  | 'tsp'
  | 'ml'
  | 'fl_oz'
  | 'g'
  | 'kg'
  | 'oz'
  | 'lb';

export type OvenTempUnit = 'c' | 'f';

export interface IngredientEntry {
  id: string;
  name: string;
  category: Exclude<IngredientCategory, 'all'>;
  gramsPerUsCup: number;
  densityGPerMl: number;
  note?: string;
}

export interface PanScalePreset {
  id: string;
  label: string;
  multiplier: number;
  detail: string;
}

export interface OvenTempPreset {
  id: string;
  label: string;
  celsius: number;
  useCase: string;
}

export interface IngredientConversionResult {
  grams: number;
  ml: number;
  weightItems: PropertyItem[];
  volumeItems: PropertyItem[];
  summaryText: string;
}

export interface OvenConversionResult {
  celsius: number;
  fahrenheit: number;
  convectionC: number;
  convectionF: number;
  gasMark: string;
  items: PropertyItem[];
  summaryText: string;
}
