export type TransformedResults = Array<{
  label?: string;
  text?: string;
  confidence?: number;
  boundingBox: DetectedBoundingBox;
}>;
