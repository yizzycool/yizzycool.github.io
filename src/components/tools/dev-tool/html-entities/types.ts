export type HtmlEntitiesMode = 'Encode' | 'Decode';

export type EntityFormat = 'named';

export type EntityScope = 'special' | 'nonAscii';

export interface HtmlEntitiesHistoryData {
  input: string;
  output: string;
  mode: HtmlEntitiesMode;
  format?: string;
  scope: EntityScope;
}
