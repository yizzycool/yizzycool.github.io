export type WheelEntry = {
  id: string;
  label: string;
  weight: number;
  color: string;
  eliminated?: boolean;
};

export type SpinSpeed = 'fast' | 'normal' | 'suspense';

export type WheelPaletteId = 'pastel' | 'oceanic' | 'sunset' | 'vibrant';

export type WheelPalette = {
  id: WheelPaletteId;
  label: string;
  colors: readonly string[];
};

export type SpinRecord = {
  id: string;
  entryId: string;
  label: string;
  color: string;
  oddsPercent: number;
  timestamp: number;
};

export type WheelPreset = {
  id: string;
  label: string;
  items: string[];
};

export type WeightedSlice = {
  entry: WheelEntry;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  probability: number;
};

export type DecisionWheelPrefs = {
  eliminateOnWin: boolean;
  soundEnabled: boolean;
  spinSpeed: SpinSpeed;
  paletteId: WheelPaletteId;
  showWinnerModal: boolean;
};
