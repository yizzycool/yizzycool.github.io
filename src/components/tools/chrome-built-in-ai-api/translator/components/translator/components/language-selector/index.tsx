'use client';

import { MouseEvent, useState } from 'react';
import useLanguageTagToHumanReadable from '@/components/tools/chrome-built-in-ai-api/translator/hooks/use-language-tag-to-human-readable';
import { Dialog } from '@headlessui/react';
import { TranslatorParams } from '@/components/tools/chrome-built-in-ai-api/types/types';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import ISO6391 from '@/components/tools/chrome-built-in-ai-api/translator/data/iso-639-1';

export default function LanguageSelector({
  params,
  type,
  changeLanguage = () => {},
}: {
  params: TranslatorParams;
  type: 'source' | 'target';
  changeLanguage: (type: string, languageCode: string) => void;
}) {
  const [opened, setOpened] = useState(false);
  const { sourceLanguage, targetLanguage } = params;

  const { languageTagToHumanReadable } = useLanguageTagToHumanReadable();

  const languageCode = type === 'source' ? sourceLanguage : targetLanguage;
  const language = languageTagToHumanReadable(languageCode);

  const openMenu = () => setOpened(true);

  const closeMenu = () => setOpened(false);

  const onLanguageClick = (
    event: MouseEvent<HTMLButtonElement>,
    code: string
  ) => {
    event.stopPropagation();
    if (code === languageCode) return;
    setOpened(false);
    changeLanguage(type, code);
  };

  return (
    <div className="mb-3 text-lg font-bold">
      <button
        className="m-auto flex items-center justify-center"
        onClick={openMenu}
      >
        {language}
        <ChevronDownIcon className="ml-2 h-6 w-6" />
      </button>
      <Dialog
        open={opened}
        as="div"
        className="fixed inset-0 z-50 focus:outline-none"
        onClose={closeMenu}
        onClick={closeMenu}
        transition
      >
        <div className="fixed inset-10 top-[90px] flex flex-col rounded-lg bg-neutral-800/50 text-center backdrop-blur">
          <div className="my-6 text-xl font-bold">Select another language</div>
          <div className="grid flex-1 grid-cols-5 gap-3 overflow-y-auto">
            {ISO6391.map((code) => (
              <button
                key={code}
                className="cursor-pointer p-3"
                onClick={(event: MouseEvent<HTMLButtonElement>) =>
                  onLanguageClick(event, code)
                }
              >
                {languageTagToHumanReadable(code)}
              </button>
            ))}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
