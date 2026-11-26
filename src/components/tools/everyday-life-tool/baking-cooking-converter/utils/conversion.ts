import type {
  IngredientConversionResult,
  IngredientEntry,
  MeasurementUnit,
  OvenConversionResult,
  OvenTempUnit,
} from '../types';

import {
  FL_OZ_ML,
  LB_G,
  METRIC_CUP_ML,
  OZ_G,
  TBSP_ML,
  TSP_ML,
  US_CUP_ML,
} from '../constants';

/**
 * Formats positive floating-point measurements concisely for kitchen use.
 */
export function formatKitchenNumber(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0';
  const abs = Math.abs(value);
  const decimals = abs >= 100 ? 1 : abs >= 10 ? 2 : 2;
  return String(Number(value.toFixed(decimals)));
}

/**
 * Formats US cup quantities with readable nearest-eighth kitchen fractions.
 */
export function formatCupFraction(cups: number): string {
  if (!Number.isFinite(cups) || cups <= 0) return '0 cups';

  const fractionMap: [number, string][] = [
    [0.125, '⅛'],
    [0.25, '¼'],
    [0.333, '⅓'],
    [0.375, '⅜'],
    [0.5, '½'],
    [0.625, '⅝'],
    [0.667, '⅔'],
    [0.75, '¾'],
    [0.875, '⅞'],
  ];

  const whole = Math.floor(cups);
  const rem = cups - whole;
  let nearestGlyph = '';
  let minDiff = 0.045;

  for (const [val, glyph] of fractionMap) {
    const diff = Math.abs(rem - val);
    if (diff < minDiff) {
      minDiff = diff;
      nearestGlyph = glyph;
    }
  }

  if (rem > 0.96) {
    return `${whole + 1} ${whole + 1 === 1 ? 'cup' : 'cups'}`;
  }

  if (nearestGlyph) {
    const prefix = whole > 0 ? `${whole} ` : '';
    const suffix = whole >= 1 ? 'cups' : 'cup';
    return `${prefix}${nearestGlyph} ${suffix}`;
  }

  const formatted = formatKitchenNumber(cups);
  return `${formatted} ${cups === 1 ? 'cup' : 'cups'}`;
}

function toBaseGramsAndMl(
  amount: number,
  unit: MeasurementUnit,
  densityGPerMl: number
): { grams: number; ml: number } {
  switch (unit) {
    case 'us_cup': {
      const ml = amount * US_CUP_ML;
      return { ml, grams: ml * densityGPerMl };
    }
    case 'metric_cup': {
      const ml = amount * METRIC_CUP_ML;
      return { ml, grams: ml * densityGPerMl };
    }
    case 'tbsp': {
      const ml = amount * TBSP_ML;
      return { ml, grams: ml * densityGPerMl };
    }
    case 'tsp': {
      const ml = amount * TSP_ML;
      return { ml, grams: ml * densityGPerMl };
    }
    case 'ml': {
      return { ml: amount, grams: amount * densityGPerMl };
    }
    case 'fl_oz': {
      const ml = amount * FL_OZ_ML;
      return { ml, grams: ml * densityGPerMl };
    }
    case 'g': {
      return { grams: amount, ml: amount / densityGPerMl };
    }
    case 'kg': {
      const grams = amount * 1000;
      return { grams, ml: grams / densityGPerMl };
    }
    case 'oz': {
      const grams = amount * OZ_G;
      return { grams, ml: grams / densityGPerMl };
    }
    case 'lb': {
      const grams = amount * LB_G;
      return { grams, ml: grams / densityGPerMl };
    }
  }
}

/**
 * Converts an ingredient amount across weight and volume units using ingredient-specific density.
 */
export function convertIngredient(
  rawAmount: number,
  unit: MeasurementUnit,
  ingredient: IngredientEntry,
  scaleMultiplier: number
): IngredientConversionResult {
  const safeAmount =
    Number.isFinite(rawAmount) && rawAmount > 0 ? rawAmount : 0;
  const scaledAmount = safeAmount * scaleMultiplier;
  const { grams, ml } = toBaseGramsAndMl(
    scaledAmount,
    unit,
    ingredient.densityGPerMl
  );

  const usCups = ml / US_CUP_ML;
  const metricCups = ml / METRIC_CUP_ML;
  const tbsp = ml / TBSP_ML;
  const tsp = ml / TSP_ML;
  const flOz = ml / FL_OZ_ML;

  const weightItems = [
    {
      id: 'g',
      label: 'Grams (g)',
      value: `${formatKitchenNumber(grams)} g`,
      badge: 'Baking Standard',
      badgeVariant: 'primary' as const,
    },
    {
      id: 'oz',
      label: 'Ounces (oz)',
      value: `${formatKitchenNumber(grams / OZ_G)} oz`,
    },
    {
      id: 'lb',
      label: 'Pounds (lb)',
      value: `${formatKitchenNumber(grams / LB_G)} lb`,
    },
    {
      id: 'kg',
      label: 'Kilograms (kg)',
      value: `${formatKitchenNumber(grams / 1000)} kg`,
    },
  ];

  const volumeItems = [
    {
      id: 'us-cup',
      label: 'US Cups (237 ml)',
      value: `${formatKitchenNumber(usCups)} cups`,
      subText:
        usCups > 0
          ? `Kitchen fraction: ~${formatCupFraction(usCups)}`
          : undefined,
    },
    {
      id: 'metric-cup',
      label: 'Metric Cups (250 ml)',
      value: `${formatKitchenNumber(metricCups)} cups`,
    },
    {
      id: 'tbsp',
      label: 'Tablespoons (tbsp)',
      value: `${formatKitchenNumber(tbsp)} tbsp`,
    },
    {
      id: 'tsp',
      label: 'Teaspoons (tsp)',
      value: `${formatKitchenNumber(tsp)} tsp`,
    },
    {
      id: 'ml',
      label: 'Milliliters (ml)',
      value: `${formatKitchenNumber(ml)} ml`,
    },
    {
      id: 'fl-oz',
      label: 'Fluid Ounces (fl oz)',
      value: `${formatKitchenNumber(flOz)} fl oz`,
    },
  ];

  const summaryText = [
    `${ingredient.name} (${scaleMultiplier}× batch):`,
    ...weightItems.map((item) => `- ${item.label}: ${item.value}`),
    ...volumeItems.map((item) => `- ${item.label}: ${item.value}`),
  ].join('\n');

  return {
    grams,
    ml,
    weightItems,
    volumeItems,
    summaryText,
  };
}

function resolveGasMark(celsius: number): string {
  if (celsius < 130) return 'Below Gas 1 (Very Slow)';
  if (celsius < 145) return 'Gas Mark 1 (~135°C)';
  if (celsius < 158) return 'Gas Mark 2 (~150°C)';
  if (celsius < 172) return 'Gas Mark 3 (~165°C)';
  if (celsius < 185) return 'Gas Mark 4 (~180°C)';
  if (celsius < 198) return 'Gas Mark 5 (~190°C)';
  if (celsius < 212) return 'Gas Mark 6 (~200°C)';
  if (celsius < 225) return 'Gas Mark 7 (~220°C)';
  if (celsius < 238) return 'Gas Mark 8 (~230°C)';
  return 'Gas Mark 9+ (Very Hot)';
}

/**
 * Converts conventional oven temperatures between °C, °F, Convection/Fan, and UK Gas Mark.
 */
export function convertOvenTemp(
  rawValue: number,
  unit: OvenTempUnit
): OvenConversionResult {
  const safeVal = Number.isFinite(rawValue) ? rawValue : 180;
  const celsius = unit === 'c' ? safeVal : ((safeVal - 32) * 5) / 9;
  const fahrenheit = unit === 'f' ? safeVal : (safeVal * 9) / 5 + 32;
  const convectionC = celsius - 20;
  const convectionF = (convectionC * 9) / 5 + 32;
  const gasMark = resolveGasMark(celsius);

  const items = [
    {
      id: 'celsius',
      label: 'Conventional Celsius',
      value: `${Math.round(celsius)} °C`,
    },
    {
      id: 'fahrenheit',
      label: 'Conventional Fahrenheit',
      value: `${Math.round(fahrenheit)} °F`,
    },
    {
      id: 'convection-c',
      label: 'Fan / Convection Oven (°C)',
      value: `${Math.round(convectionC)} °C`,
      subText: 'Standard -20°C rule for fan-forced ovens',
    },
    {
      id: 'convection-f',
      label: 'Fan / Convection Oven (°F)',
      value: `${Math.round(convectionF)} °F`,
      subText: 'Standard -25°F to -35°F equivalent',
    },
    {
      id: 'gas-mark',
      label: 'UK Gas Mark',
      value: gasMark,
    },
  ];

  const summaryText = items
    .map((item) => `${item.label}: ${item.value}`)
    .join('\n');

  return {
    celsius,
    fahrenheit,
    convectionC,
    convectionF,
    gasMark,
    items,
    summaryText,
  };
}
