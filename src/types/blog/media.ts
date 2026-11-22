import type { BaseBlogData } from './base';

export type BlogMediaFormatKey = 'thumbnail' | 'small' | 'medium' | 'large';

export type BlogMediaFocalPoint = {
  x: number;
  y: number;
};

export type BlogMediaFormat = {
  name: string;
  hash: string;
  ext: string | null;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes?: number;
  url: string;
  provider_metadata?: Record<string, unknown> | null;
};

export type BlogMediaFormats = Partial<
  Record<BlogMediaFormatKey, BlogMediaFormat>
>;

export interface BlogMediaData extends BaseBlogData {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: BlogMediaFormats | null;
  hash: string;
  ext: string | null;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: Record<string, unknown> | null;
  focalPoint?: BlogMediaFocalPoint | null;
  isUrlSigned?: boolean;
  locale?: string | null;
}
