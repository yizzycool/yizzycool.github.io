import type { LucideIcon } from 'lucide-react';
import type {
  ConverterMode,
  IngredientCategory,
  IngredientEntry,
  MeasurementUnit,
  OvenTempPreset,
  OvenTempUnit,
  PanScalePreset,
} from './types';

import {
  Bean,
  CakeSlice,
  Candy,
  ChefHat,
  Coffee,
  Cookie,
  Croissant,
  CupSoda,
  Droplet,
  Droplets,
  Flame,
  FlaskConical,
  LayoutGrid,
  Milk,
  Scale,
  Sparkles,
  Wheat,
} from 'lucide-react';

export const US_CUP_ML = 236.5882365;
export const METRIC_CUP_ML = 250;
export const TBSP_ML = 14.7867648;
export const TSP_ML = 4.9289216;
export const FL_OZ_ML = 29.5735296;
export const OZ_G = 28.3495231;
export const LB_G = 453.59237;

export const CONVERTER_MODE_TABS: ConverterMode[] = ['ingredients', 'oven'];

export const CONVERTER_MODE_LABELS: Record<ConverterMode, string> = {
  ingredients: 'Ingredient Density',
  oven: 'Oven Temperature',
};

export const CONVERTER_MODE_ICONS = {
  ingredients: Scale,
  oven: Flame,
};

export const OVEN_UNIT_TABS: OvenTempUnit[] = ['c', 'f'];

export const OVEN_UNIT_LABELS: Record<OvenTempUnit, string> = {
  c: 'Celsius (°C)',
  f: 'Fahrenheit (°F)',
};

export const INGREDIENT_CATEGORIES: readonly {
  id: IngredientCategory;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'flours', label: 'Flours & Starches', icon: Wheat },
  { id: 'sugars', label: 'Sugars & Syrups', icon: Candy },
  { id: 'dairy', label: 'Dairy & Fats', icon: Milk },
  { id: 'liquids', label: 'Liquids', icon: Droplets },
  { id: 'pantry', label: 'Pantry & Leaveners', icon: ChefHat },
];

export const INGREDIENT_CATEGORY_STYLES: Record<
  Exclude<IngredientCategory, 'all'>,
  { icon: LucideIcon; badgeClass: string }
> = {
  flours: {
    icon: Wheat,
    badgeClass:
      'bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  },
  sugars: {
    icon: Candy,
    badgeClass:
      'bg-rose-500/10 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300',
  },
  dairy: {
    icon: Milk,
    badgeClass:
      'bg-orange-500/10 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
  },
  liquids: {
    icon: Droplets,
    badgeClass:
      'bg-sky-500/10 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
  },
  pantry: {
    icon: ChefHat,
    badgeClass:
      'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  },
};

export const INGREDIENT_ICON_OVERRIDES: Partial<Record<string, LucideIcon>> = {
  'bread-flour': Croissant,
  'cake-flour': CakeSlice,
  'cocoa-powder': Coffee,
  'powdered-sugar': Sparkles,
  honey: Droplet,
  'maple-syrup': Droplet,
  'vegetable-oil': Droplet,
  'olive-oil': Droplet,
  'heavy-cream': CupSoda,
  yogurt: CupSoda,
  water: Droplet,
  'soy-sauce': Droplet,
  vinegar: FlaskConical,
  'baking-powder': FlaskConical,
  'baking-soda': FlaskConical,
  'table-salt': Sparkles,
  'kosher-salt': Sparkles,
  'active-yeast': Bean,
  'chocolate-chips': Cookie,
  'peanut-butter': Bean,
};

export const MEASUREMENT_UNIT_OPTIONS: readonly {
  label: string;
  value: MeasurementUnit;
}[] = [
  { label: 'US Cup (237 ml)', value: 'us_cup' },
  { label: 'Metric Cup (250 ml)', value: 'metric_cup' },
  { label: 'Tablespoon (tbsp)', value: 'tbsp' },
  { label: 'Teaspoon (tsp)', value: 'tsp' },
  { label: 'Milliliter (ml)', value: 'ml' },
  { label: 'Fluid Ounce (fl oz)', value: 'fl_oz' },
  { label: 'Gram (g)', value: 'g' },
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Ounce (oz)', value: 'oz' },
  { label: 'Pound (lb)', value: 'lb' },
];

function createIngredient(
  id: string,
  name: string,
  category: IngredientEntry['category'],
  gramsPerUsCup: number,
  note?: string
): IngredientEntry {
  return {
    id,
    name,
    category,
    gramsPerUsCup,
    densityGPerMl: gramsPerUsCup / US_CUP_ML,
    note,
  };
}

export const INGREDIENT_DATABASE: readonly IngredientEntry[] = [
  // Flours & Starches
  createIngredient(
    'ap-flour',
    'All-Purpose Flour',
    'flours',
    120,
    'Spoon & leveled standard weight'
  ),
  createIngredient('bread-flour', 'Bread Flour', 'flours', 127),
  createIngredient('cake-flour', 'Cake Flour', 'flours', 114, 'Sifted light'),
  createIngredient('whole-wheat-flour', 'Whole Wheat Flour', 'flours', 128),
  createIngredient(
    'almond-flour',
    'Almond Flour',
    'flours',
    96,
    'Finely ground'
  ),
  createIngredient('cornstarch', 'Cornstarch', 'flours', 128),
  createIngredient('cocoa-powder', 'Cocoa Powder (Unsweetened)', 'flours', 85),
  createIngredient('rolled-oats', 'Rolled Oats', 'flours', 90),

  // Sugars & Syrups
  createIngredient('granulated-sugar', 'Granulated Sugar', 'sugars', 200),
  createIngredient(
    'brown-sugar',
    'Brown Sugar (Packed)',
    'sugars',
    213,
    'Firmly packed in cup'
  ),
  createIngredient('powdered-sugar', 'Powdered Sugar', 'sugars', 120),
  createIngredient('honey', 'Honey', 'sugars', 340),
  createIngredient('maple-syrup', 'Maple Syrup', 'sugars', 315),

  // Dairy & Fats
  createIngredient(
    'butter',
    'Unsalted Butter',
    'dairy',
    227,
    '2 US sticks = 1 cup'
  ),
  createIngredient('vegetable-oil', 'Vegetable / Canola Oil', 'dairy', 218),
  createIngredient('olive-oil', 'Olive Oil', 'dairy', 216),
  createIngredient('whole-milk', 'Whole Milk', 'dairy', 244),
  createIngredient('heavy-cream', 'Heavy Whipping Cream', 'dairy', 238),
  createIngredient('yogurt', 'Plain / Greek Yogurt', 'dairy', 245),
  createIngredient('cream-cheese', 'Cream Cheese', 'dairy', 232),

  // Liquids
  createIngredient('water', 'Water', 'liquids', 237),
  createIngredient('soy-sauce', 'Soy Sauce', 'liquids', 255),
  createIngredient('vinegar', 'White / Cider Vinegar', 'liquids', 240),

  // Pantry & Leaveners
  createIngredient(
    'baking-powder',
    'Baking Powder',
    'pantry',
    192,
    '~4g / tsp'
  ),
  createIngredient('baking-soda', 'Baking Soda', 'pantry', 220, '~4.6g / tsp'),
  createIngredient('table-salt', 'Fine Table Salt', 'pantry', 288, '~6g / tsp'),
  createIngredient(
    'kosher-salt',
    'Kosher Salt (Diamond Crystal)',
    'pantry',
    144,
    '~3g / tsp'
  ),
  createIngredient(
    'active-yeast',
    'Active Dry Yeast',
    'pantry',
    150,
    '~3.1g / tsp'
  ),
  createIngredient('chocolate-chips', 'Chocolate Chips', 'pantry', 170),
  createIngredient('peanut-butter', 'Peanut Butter', 'pantry', 258),
];

export const AMOUNT_PRESETS: readonly number[] = [
  0.25, 0.5, 0.75, 1, 1.5, 2, 100, 250,
];

export const SCALE_PRESETS: readonly number[] = [0.5, 1, 1.5, 2, 3];

export const PAN_SCALE_PRESETS: readonly PanScalePreset[] = [
  {
    id: '6-to-8',
    label: '6" → 8"',
    multiplier: 1.78,
    detail: 'Round pan area ×1.78',
  },
  {
    id: '8-to-9',
    label: '8" → 9"',
    multiplier: 1.27,
    detail: 'Round pan area ×1.27',
  },
  {
    id: '8-to-6',
    label: '8" → 6"',
    multiplier: 0.56,
    detail: 'Round pan area ×0.56',
  },
  {
    id: '9-to-8',
    label: '9" → 8"',
    multiplier: 0.79,
    detail: 'Round pan area ×0.79',
  },
];

export const OVEN_TEMP_PRESETS: readonly OvenTempPreset[] = [
  { id: 'slow', label: '150°C', celsius: 150, useCase: 'Slow Bake / Meringue' },
  { id: 'chiffon', label: '170°C', celsius: 170, useCase: 'Chiffon & Sponge' },
  { id: 'cookies', label: '180°C', celsius: 180, useCase: 'Cakes & Cookies' },
  {
    id: 'roast',
    label: '200°C',
    celsius: 200,
    useCase: 'Crisp Roast & Pastry',
  },
  {
    id: 'bread',
    label: '230°C',
    celsius: 230,
    useCase: 'Artisan Bread & Pizza',
  },
];
