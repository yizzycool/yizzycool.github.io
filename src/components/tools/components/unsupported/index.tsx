'use client';

import { OctagonAlert, OctagonX } from 'lucide-react';
import _get from 'lodash/get';
import { useMemo } from 'react';

export const UnsupportedApiTypes = {
  chromeBuiltInAiApi: 'chrome-built-in-ai-api',
  chromeLanguageDetectorApi: 'chrome-language-detector-api',
  chromePromptApi: 'chrome-prompt-api',
  chromeRewriter: 'chrome-rewriter',
  chromeSummarizerApi: 'chrome-summarizer-api',
  chromeTranslatorApi: 'chrome-translator-api',
  chromeWriter: 'chrome-writer',
  webDetectionApi: 'web-detection-api',
};

export const UnsupportedTypes = {
  unsupported: 'unsupported',
  partialUnsupported: 'partial-unsupported',
};

const ChromeFlags = {
  [UnsupportedApiTypes.chromeLanguageDetectorApi]:
    'chrome://flags/#language-detection-api',
  [UnsupportedApiTypes.chromePromptApi]:
    'chrome://flags/#prompt-api-for-gemini-nano',
  [UnsupportedApiTypes.chromeRewriter]:
    'chrome://flags/#rewriter-api-for-gemini-nano',
  [UnsupportedApiTypes.chromeSummarizerApi]:
    'chrome://flags/#summarization-api-for-gemini-nano',
  [UnsupportedApiTypes.chromeTranslatorApi]: 'chrome://flags/#translation-api',
  [UnsupportedApiTypes.chromeWriter]:
    'chrome://flags/#writer-api-for-gemini-nano',
  [UnsupportedApiTypes.webDetectionApi]:
    'chrome://flags/#enable-experimental-web-platform-features',
};

const TypeInfo = {
  [UnsupportedTypes.unsupported]: {
    title: 'Feature Unavailable',
    desc: 'This feature is currently unavailable on your device. Please try again later.',
    descWithChromeFlag:
      'This feature is currently unavailable on your device.<br> To enable it, go to <span class="font-bold text-cyan-600">{{chrome-flag}}</span>, enable the setting, and restart your browser.',
    icon: <OctagonX className="h-full w-full text-red-500" />,
  },
  [UnsupportedTypes.partialUnsupported]: {
    title: 'Unstable API',
    desc: 'Although your device supports this API, an error occurred during the creation process. This might be because the API is still in the development stage and remains unstable on some devices. Please try again later!',
    icon: <OctagonAlert className="h-full w-full text-yellow-500" />,
  },
};

export type UnsupportedApiType =
  (typeof UnsupportedApiTypes)[keyof typeof UnsupportedApiTypes];
export type UnsupportedType =
  (typeof UnsupportedTypes)[keyof typeof UnsupportedTypes];

export default function Unsupported({
  apiType = UnsupportedApiTypes.chromeBuiltInAiApi,
  type = UnsupportedTypes.unsupported,
}: {
  apiType?: UnsupportedApiType;
  type: UnsupportedType;
}) {
  const iconComponent = useMemo(() => {
    return _get(TypeInfo, [type, 'icon']);
  }, [type]);

  const title = useMemo(() => {
    return _get(TypeInfo, [type, 'title']);
  }, [type]);

  const desc = useMemo(() => {
    if (type === UnsupportedTypes.partialUnsupported) {
      return _get(TypeInfo, [type, 'desc']);
    } else {
      const chromeFlag = _get(ChromeFlags, apiType) || '';
      if (chromeFlag) {
        const descWithChromeFlag =
          _get(TypeInfo, [type, 'descWithChromeFlag']) || '';
        return descWithChromeFlag.replace('{{chrome-flag}}', chromeFlag);
      }
      return _get(TypeInfo, [type, 'desc']);
    }
  }, [apiType, type]);

  return (
    <div className="mx-auto mt-10 max-w-screen-sm px-5 py-20 text-center">
      <div className="mx-auto h-20 w-20">{iconComponent}</div>
      <div className="mt-10 text-xl font-bold">{title}</div>
      <div className="mt-5" dangerouslySetInnerHTML={{ __html: desc }}></div>
    </div>
  );
}
