import type {
  DecisionWheelPrefs,
  SpinSpeed,
  WheelEntry,
  WheelPalette,
  WheelPaletteId,
  WheelPreset,
} from './types';

export const DECISION_WHEEL_STORAGE_KEY = 'decision-wheel-entries-v3';
export const DECISION_WHEEL_PREFS_STORAGE_KEY = 'decision-wheel-prefs-v2';

export const MAX_ENTRIES = 40;
export const MIN_PERCENT = 0;
export const MAX_PERCENT = 100;
export const MAX_LABEL_LENGTH = 48;
export const MAX_HISTORY_RECORDS = 20;

export const WHEEL_PALETTES: readonly WheelPalette[] = [
  {
    id: 'pastel',
    label: 'Soft Pastel',
    colors: [
      '#bae6fd', // sky-200
      '#ddd6fe', // violet-200
      '#fecdd3', // rose-200
      '#fde68a', // amber-200
      '#a7f3d0', // emerald-200
      '#fed7aa', // orange-200
      '#c7d2fe', // indigo-200
      '#99f6e4', // teal-200
    ],
  },
  {
    id: 'oceanic',
    label: 'Oceanic',
    colors: [
      '#0284c7', // sky-600
      '#38bdf8', // sky-400
      '#0ea5e9', // sky-500
      '#6366f1', // indigo-500
      '#818cf8', // indigo-400
      '#14b8a6', // teal-500
      '#2dd4bf', // teal-400
      '#0369a1', // sky-700
    ],
  },
  {
    id: 'sunset',
    label: 'Warm Sunset',
    colors: [
      '#fda4af', // rose-300
      '#fdba74', // orange-300
      '#fcd34d', // amber-300
      '#f9a8d4', // pink-300
      '#fca5a5', // red-300
      '#c4b5fd', // violet-300
      '#fb7185', // rose-400
      '#fbbf24', // amber-400
    ],
  },
  {
    id: 'vibrant',
    label: 'Vibrant',
    colors: [
      '#0ea5e9', // sky-500
      '#6366f1', // indigo-500
      '#ec4899', // pink-500
      '#f59e0b', // amber-500
      '#10b981', // emerald-500
      '#f97316', // orange-500
      '#8b5cf6', // violet-500
      '#14b8a6', // teal-500
    ],
  },
];

export const WHEEL_PALETTE: readonly string[] = WHEEL_PALETTES[0].colors;

export function getPaletteColors(paletteId: WheelPaletteId): readonly string[] {
  return (
    WHEEL_PALETTES.find((palette) => palette.id === paletteId)?.colors ??
    WHEEL_PALETTE
  );
}

export const SPIN_DURATION_MS: Record<SpinSpeed, number> = {
  fast: 2600,
  normal: 4600,
  suspense: 7000,
};

export const SPIN_EXTRA_ROTATIONS: Record<SpinSpeed, number> = {
  fast: 4,
  normal: 6,
  suspense: 9,
};

export const SPIN_SPEED_LABELS: Record<SpinSpeed, string> = {
  fast: 'Fast',
  normal: 'Normal',
  suspense: 'Suspense',
};

export const DEFAULT_PREFS: DecisionWheelPrefs = {
  eliminateOnWin: false,
  soundEnabled: true,
  spinSpeed: 'normal',
  paletteId: 'pastel',
  showWinnerModal: true,
};

export const WHEEL_PRESETS: readonly WheelPreset[] = [
  {
    id: 'lunch',
    label: 'What to Eat',
    items: ['Ramen', 'Sushi', 'Pizza', 'Tacos'],
  },
  {
    id: 'who-pays',
    label: 'Who Pays?',
    items: ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona'],
  },
  {
    id: 'yes-no',
    label: 'Yes or No',
    items: ['Yes, Go For It!', 'No, Skip It', 'Ask Again Later', 'Flip a Coin'],
  },
  {
    id: 'party',
    label: 'Party Dare',
    items: [
      'Tell a Funny Story',
      'Sing a Chorus',
      'Buy Next Round',
      'Do 10 Squats',
      'Share Last Photo',
      'Safe Pass!',
    ],
  },
];

export const INITIAL_ENTRIES: WheelEntry[] = WHEEL_PRESETS[0].items.map(
  (label, idx) => ({
    id: `default-opt-${idx}`,
    label,
    weight: 25,
    color: WHEEL_PALETTE[idx % WHEEL_PALETTE.length],
    eliminated: false,
  })
);
