const intlUtils = {
  languageTagToHumanReadable: (
    languageTag: string,
    targetLanguage: string | undefined = 'en'
  ): string | undefined => {
    if (!languageTag || !targetLanguage) return '';
    const displayNames = new Intl.DisplayNames([targetLanguage], {
      type: 'language',
    });
    return displayNames.of(languageTag);
  },
};

export default intlUtils;
