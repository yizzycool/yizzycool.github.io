export const TAB_ITEMS = ['Encode', 'Decode'] as const;

export type TabItem = (typeof TAB_ITEMS)[number];

export type Base64Format = 'standard' | 'base64url';

export type Base64EncoderDecoderHistoryData = {
  input: string;
  output: string;
  mode: TabItem;
  format: Base64Format;
};
