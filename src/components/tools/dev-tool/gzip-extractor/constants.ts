import type { InputSource, TarPreviewState } from './types';

export const INPUT_SOURCES: InputSource[] = ['file', 'text'];

export const SAMPLE_BASE64_GZIP =
  'H4sIAKR41GoAAzWOXQuCMBiF7/sV4nXKNi3UO6kIQQta3nQjQ19q4BdzGhb+9zZHt+d5zuF8N5ZlS97AIFnT25FlE0T2DkYODu54F3koQuhhb7U2gJh4CVpio3w5TybhzWYDYYJWapTT061Ir+fkUtD8cDhRaoRR1ZNKG+MgijAMiO97O8/AsuaqnqwHcEhcvA9c7GIUGFyBZLweFNV/VdCLTnZlV2ufxlnqEBetqmETr0BoFn9GAfHxj2r1uC3nTC/5RGXLZvkBugCKLwIBAAA=';

export const INITIAL_PREVIEW_STATE: TarPreviewState = {
  isOpen: false,
  entry: null,
  isText: false,
  isImage: false,
  textContent: null,
  imageUrl: null,
  syntaxLanguage: 'text',
};
