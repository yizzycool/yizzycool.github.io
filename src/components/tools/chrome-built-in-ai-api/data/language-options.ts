export interface LanguageOption {
  label: string;
  value: string;
}

export const WRITER_OUTPUT_LANGUAGES: LanguageOption[] = [
  { label: 'Auto (Match instructions)', value: 'auto' },
  { label: '繁體中文 (Traditional Chinese)', value: 'zh-TW' },
  { label: '简体中文 (Simplified Chinese)', value: 'zh-CN' },
  { label: 'English', value: 'en' },
  { label: '日本語 (Japanese)', value: 'ja' },
  { label: 'Español (Spanish)', value: 'es' },
  { label: 'Français (French)', value: 'fr' },
  { label: 'Deutsch (German)', value: 'de' },
];

export const REWRITER_OUTPUT_LANGUAGES: LanguageOption[] = [
  { label: 'As-is (Keep source language)', value: 'as-is' },
  { label: '繁體中文 (Traditional Chinese)', value: 'zh-TW' },
  { label: '简体中文 (Simplified Chinese)', value: 'zh-CN' },
  { label: 'English', value: 'en' },
  { label: '日本語 (Japanese)', value: 'ja' },
  { label: 'Español (Spanish)', value: 'es' },
  { label: 'Français (French)', value: 'fr' },
  { label: 'Deutsch (German)', value: 'de' },
];

export const SUMMARIZER_OUTPUT_LANGUAGES: LanguageOption[] = [
  { label: 'Auto (Keep source language)', value: 'auto' },
  { label: '繁體中文 (Traditional Chinese)', value: 'zh-TW' },
  { label: '简体中文 (Simplified Chinese)', value: 'zh-CN' },
  { label: 'English', value: 'en' },
  { label: '日本語 (Japanese)', value: 'ja' },
  { label: 'Español (Spanish)', value: 'es' },
  { label: 'Français (French)', value: 'fr' },
  { label: 'Deutsch (German)', value: 'de' },
];

export const PROMPT_OUTPUT_LANGUAGES: LanguageOption[] = [
  { label: 'Auto (Default)', value: 'auto' },
  { label: '繁體中文 (Traditional Chinese)', value: 'zh-TW' },
  { label: '简体中文 (Simplified Chinese)', value: 'zh-CN' },
  { label: 'English', value: 'en' },
  { label: '日本語 (Japanese)', value: 'ja' },
  { label: 'Español (Spanish)', value: 'es' },
  { label: 'Français (French)', value: 'fr' },
  { label: 'Deutsch (German)', value: 'de' },
];

export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  'zh-TW': 'Traditional Chinese (繁體中文)',
  'zh-CN': 'Simplified Chinese (简体中文)',
  en: 'English',
  ja: 'Japanese (日本語)',
  es: 'Spanish (Español)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
};

export function getLanguageDisplayName(code?: string): string | null {
  if (!code || code === 'auto' || code === 'as-is') return null;
  return LANGUAGE_DISPLAY_NAMES[code] || code;
}
