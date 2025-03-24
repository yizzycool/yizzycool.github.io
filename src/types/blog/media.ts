import { BaseBlogData } from './base';

export interface BlogMediaData extends BaseBlogData {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail: BlogMediaFormat;
    small: BlogMediaFormat;
    medium: BlogMediaFormat;
    large: BlogMediaFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: string | null;
}

type BlogMediaFormat = {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
};
