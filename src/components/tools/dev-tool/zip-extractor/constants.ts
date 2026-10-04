import type { PreviewState } from './types';

export const MAX_PREVIEW_TEXT_SIZE = 1024 * 1024; // 1 MB

export const SYNTAX_LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'tsx',
  html: 'html',
  htm: 'html',
  xml: 'xml',
  svg: 'xml',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  markdown: 'markdown',
  py: 'python',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  sql: 'sql',
  rs: 'rust',
  go: 'go',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
  java: 'java',
  php: 'php',
  rb: 'ruby',
  swift: 'swift',
  toml: 'toml',
  ini: 'ini',
  env: 'ini',
  txt: 'text',
  log: 'text',
  csv: 'text',
};

export const TEXT_EXTENSIONS = new Set(Object.keys(SYNTAX_LANGUAGE_MAP));

export const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'ico',
  'bmp',
]);

export const INITIAL_PREVIEW_STATE: PreviewState = {
  isOpen: false,
  entry: null,
  isLoading: false,
  isText: false,
  isImage: false,
  textContent: null,
  imageUrl: null,
  syntaxLanguage: 'text',
  error: null,
};
