'use client';

export default function useLanguageTagToHumanReadable() {
  const languageTagToHumanReadable = (
    languageTag: string,
    targetLanguage: string
  ): string | undefined => {
    if (!languageTag || !targetLanguage) return '';
    const displayNames = new Intl.DisplayNames([targetLanguage], {
      type: 'language',
    });
    return displayNames.of(languageTag);
  };

  return {
    languageTagToHumanReadable,
  };
}
