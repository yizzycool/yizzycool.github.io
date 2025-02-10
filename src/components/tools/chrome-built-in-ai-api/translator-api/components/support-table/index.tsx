'use client';

import clsx from 'clsx';
import { useEffect } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { TranslatorApiSupportedStatus } from '../..';
import ApiStatus from '../api-status';
import _get from 'lodash/get';
import _isNull from 'lodash/isNull';

type WindowAi = {
  ai?: {
    translator?: object;
    languageDetector?: object;
  };
};

type windowTranslation = {
  Translation?: object;
};

const ApiList = [
  {
    name: 'AI Translator',
    url: 'https://developer.chrome.com/docs/ai/translator-api',
    supportKey: 'translator',
  },
  {
    name: 'AI Language Detector',
    url: 'https://developer.chrome.com/docs/ai/language-detection',
    supportKey: 'languageDetector',
  },
];

export default function SupportTable({
  apiSupportedStatus,
  setApiSupportedStatus,
}: {
  apiSupportedStatus: TranslatorApiSupportedStatus;
  setApiSupportedStatus: React.Dispatch<
    React.SetStateAction<TranslatorApiSupportedStatus>
  >;
}) {
  useEffect(() => {
    // Detect API capability
    setTimeout(() => {
      checkTranslatorSupported();
      checkLanguageDetectorSupported();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // To check if translator is supported
  const checkTranslatorSupported = () => {
    const ai = (window as unknown as WindowAi).ai;
    const translation = (window as unknown as windowTranslation).Translation;
    const translator = ai?.translator || translation;
    setApiSupportedStatus((ps) => ({ ...ps, translator: !!translator }));
  };

  // To check if language detector is supported
  const checkLanguageDetectorSupported = () => {
    const ai = (window as unknown as WindowAi).ai;
    const languageDetector = ai?.languageDetector;
    setApiSupportedStatus((ps) => ({
      ...ps,
      languageDetector: !!languageDetector,
    }));
  };

  return (
    <table className="mx-auto mt-10 table-auto text-left">
      <thead>
        <tr className="border-b border-neutral-700">
          <th className="p-4">API</th>
          <th className="p-4 text-center">Is Your Device Supported?</th>
        </tr>
      </thead>
      <tbody>
        {ApiList.map((api, idx) => (
          <tr key={idx}>
            <td className="p-4">
              <a
                className="hover:underline"
                href={api.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {api.name}
                <ArrowTopRightOnSquareIcon className="ml-2 inline h-4 w-4" />
              </a>
            </td>
            <td className="p-4">
              <div
                data-supported={JSON.stringify(
                  _get(apiSupportedStatus, api.supportKey)
                )}
                className={clsx(
                  'm-auto flex w-fit items-center justify-center rounded-md px-2 py-1 text-xs font-medium',
                  'data-[supported=null]:bg-gray-400/10 data-[supported=null]:text-gray-400',
                  'data-[supported=true]:bg-green-400/10 data-[supported=true]:text-green-400',
                  'data-[supported=false]:bg-red-400/10 data-[supported=false]:text-red-400'
                )}
              >
                <ApiStatus
                  supportStatus={apiSupportedStatus}
                  supportKey={api.supportKey}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
