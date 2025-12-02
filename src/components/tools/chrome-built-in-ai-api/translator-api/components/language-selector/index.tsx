'use client';

import clsx from 'clsx';
import { MouseEvent, useMemo, useState } from 'react';
import intlUtils from '@/utils/intl-utils';
import { Check, ChevronDown, Globe, Search } from 'lucide-react';
import GeneralDialog from '@/components/common/dialog/general';
import ISO6391 from '@/components/tools/chrome-built-in-ai-api/translator-api/data/iso-639-1';
import _isEmpty from 'lodash/isEmpty';
import _filter from 'lodash/filter';
import _startsWith from 'lodash/startsWith';

export default function LanguageSelector({
  params,
  type,
  changeLanguage = () => {},
}: {
  params: AITranslatorCreateOptions;
  type: 'source' | 'target';
  changeLanguage: (type: string, languageCode: string) => void;
}) {
  const { sourceLanguage, targetLanguage } = params;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const languageCode = type === 'source' ? sourceLanguage : targetLanguage;
  const language = intlUtils.languageTagToHumanReadable(languageCode);

  const languages = useMemo(() => {
    return ISO6391.map((code) => {
      const name = intlUtils.languageTagToHumanReadable(code);
      const localName = intlUtils.languageTagToHumanReadable(code, code);
      return { code, name, localName };
    });
  }, []);

  const filteredLanguages = useMemo(() => {
    if (_isEmpty(searchQuery)) return languages;
    return _filter(languages, ({ name, localName }) => {
      return (
        _startsWith(name, searchQuery) || _startsWith(localName, searchQuery)
      );
    });
  }, [languages, searchQuery]);

  const openMenu = () => setIsOpen(true);

  const closeMenu = () => setIsOpen(false);

  const onLanguageClick = (
    event: MouseEvent<HTMLButtonElement>,
    code: string
  ) => {
    event.stopPropagation();
    if (code === languageCode) return;
    setIsOpen(false);
    changeLanguage(type, code);
  };

  return (
    <div className="text-sm font-semibold">
      <button
        className={clsx(
          'm-auto flex items-center justify-center rounded-md px-3 py-2 transition-all',
          'hover:bg-neutral-200 dark:hover:bg-neutral-700',
          'text-neutral-500 dark:text-neutral-400'
        )}
        onClick={openMenu}
      >
        {language}
        <ChevronDown className="ml-2" size={16} />
      </button>

      <GeneralDialog
        isOpen={isOpen}
        onClose={closeMenu}
        title="Select Language"
        className="w-full"
      >
        {/* Header: title and search */}
        <div
          className={clsx(
            'z-10 flex flex-col',
            'bg-white dark:bg-[#111]',
            'border-b border-slate-100 dark:border-white/5'
          )}
        >
          <div className="px-8 pb-6">
            <div className="group relative">
              {/* Search Icon */}
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 transition-all group-focus-within:font-bold"
                size={18}
              />
              <input
                type="text"
                placeholder="Search language..."
                className={clsx(
                  'w-full rounded-2xl border-none py-3.5 pl-12 pr-4 font-medium outline-none transition-all',
                  'bg-neutral-100 dark:bg-white/5',
                  'text-neutral-900 placeholder:text-neutral-400 dark:text-neutral-100',
                  'focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/20'
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {filteredLanguages.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={(e) => onLanguageClick(e, lang.code)}
                  className={`group flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                    lang.code === languageCode
                      ? 'border-slate-900 bg-slate-50 shadow-sm dark:border-white dark:bg-white/5'
                      : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:border-slate-700 dark:hover:bg-white/[0.08]'
                  } `}
                >
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`text-sm font-semibold tracking-tight ${lang.code === languageCode ? 'text-slate-900 dark:text-white' : 'text-slate-600 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white'}`}
                    >
                      {lang.name}
                    </span>
                    <span
                      className={`text-xs ${lang.code === languageCode ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                      {lang.localName}
                    </span>
                  </div>

                  {lang.code === languageCode && (
                    <div className="ml-4 rounded-full bg-slate-900 p-1 text-white dark:bg-white dark:text-black">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Globe size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                No languages found
              </p>
              <p className="text-sm opacity-60">
                Try searching for the English name or local name
              </p>
            </div>
          )}
        </div>
      </GeneralDialog>
    </div>
  );
}
