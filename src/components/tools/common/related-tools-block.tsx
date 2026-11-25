'use client';

import type { LucideIcon } from 'lucide-react';

import { Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { findKey, get } from 'lodash';

import {
  ToolDescriptions,
  ToolIcons,
  ToolKeys,
  ToolTitles,
  ToolUrls,
} from '@/data/tools';

import { RelatedToolItem } from './related-tool-item';

const RELATED_TOOLS_MAP: Record<string, readonly string[]> = {
  // Everyday Life Tools
  [ToolKeys.markdownNotes]: [ToolKeys.wordCounter, ToolKeys.keyCard],
  [ToolKeys.wordCounter]: [ToolKeys.markdownNotes, ToolKeys.keyCard],
  [ToolKeys.keyCard]: [ToolKeys.markdownNotes, ToolKeys.wordCounter],
  [ToolKeys.qrCodeGenerator]: [
    ToolKeys.wifiCardGenerator,
    ToolKeys.chromeBarcodeDetector,
    ToolKeys.photoEditorStudio,
  ],
  [ToolKeys.wifiCardGenerator]: [
    ToolKeys.qrCodeGenerator,
    ToolKeys.chromeBarcodeDetector,
    ToolKeys.picMergeStudio,
  ],
  [ToolKeys.signatureStampMaker]: [
    ToolKeys.photoEditorStudio,
    ToolKeys.picMergeStudio,
  ],

  // Image Tools
  [ToolKeys.photoEditorStudio]: [
    ToolKeys.picMergeStudio,
    ToolKeys.signatureStampMaker,
  ],
  [ToolKeys.picMergeStudio]: [
    ToolKeys.photoEditorStudio,
    ToolKeys.qrCodeGenerator,
  ],
  [ToolKeys.imageToBase64]: [
    ToolKeys.base64ToImage,
    ToolKeys.photoEditorStudio,
  ],
  [ToolKeys.base64ToImage]: [
    ToolKeys.imageToBase64,
    ToolKeys.photoEditorStudio,
  ],

  // Developer Tools
  [ToolKeys.jsonFormatter]: [
    ToolKeys.jwtDebugger,
    ToolKeys.unixTimestampConverter,
    ToolKeys.regexTester,
  ],
  [ToolKeys.jwtDebugger]: [
    ToolKeys.jsonFormatter,
    ToolKeys.unixTimestampConverter,
    ToolKeys.base64EncoderDecoder,
  ],
  [ToolKeys.unixTimestampConverter]: [
    ToolKeys.jwtDebugger,
    ToolKeys.jsonFormatter,
  ],
  [ToolKeys.urlEncoderDecoder]: [
    ToolKeys.base64EncoderDecoder,
    ToolKeys.htmlEntities,
  ],
  [ToolKeys.base64EncoderDecoder]: [
    ToolKeys.urlEncoderDecoder,
    ToolKeys.htmlEntities,
  ],
  [ToolKeys.htmlEntities]: [
    ToolKeys.urlEncoderDecoder,
    ToolKeys.base64EncoderDecoder,
  ],
  [ToolKeys.regexTester]: [
    ToolKeys.wordCounter,
    ToolKeys.urlEncoderDecoder,
    ToolKeys.jsonFormatter,
  ],
  [ToolKeys.hashGenerator]: [
    ToolKeys.uuidGenerator,
    ToolKeys.base64EncoderDecoder,
  ],
  [ToolKeys.uuidGenerator]: [ToolKeys.hashGenerator, ToolKeys.jsonFormatter],
  [ToolKeys.colorConverter]: [
    ToolKeys.photoEditorStudio,
    ToolKeys.qrCodeGenerator,
  ],
  [ToolKeys.hexBinaryConverter]: [
    ToolKeys.cidrCalculator,
    ToolKeys.base64EncoderDecoder,
  ],
  [ToolKeys.cidrCalculator]: [ToolKeys.hexBinaryConverter],
  [ToolKeys.zipExtractor]: [ToolKeys.gzipExtractor],
  [ToolKeys.gzipExtractor]: [ToolKeys.zipExtractor],

  // Chrome Built-in AI APIs
  [ToolKeys.chromeAiWriter]: [
    ToolKeys.chromeAiRewriter,
    ToolKeys.chromeAiSummarizer,
    ToolKeys.chromeAiProofreader,
  ],
  [ToolKeys.chromeAiRewriter]: [
    ToolKeys.chromeAiWriter,
    ToolKeys.chromeAiSummarizer,
    ToolKeys.chromeAiProofreader,
  ],
  [ToolKeys.chromeAiSummarizer]: [
    ToolKeys.chromeAiWriter,
    ToolKeys.chromeAiRewriter,
    ToolKeys.chromeAiProofreader,
  ],
  [ToolKeys.chromeAiProofreader]: [
    ToolKeys.chromeAiWriter,
    ToolKeys.chromeAiRewriter,
    ToolKeys.chromeAiSummarizer,
  ],
  [ToolKeys.chromeAiPrompt]: [
    ToolKeys.chromeAiTranslator,
    ToolKeys.chromeAiLanguageDetector,
  ],
  [ToolKeys.chromeAiTranslator]: [
    ToolKeys.chromeAiLanguageDetector,
    ToolKeys.chromeAiPrompt,
  ],
  [ToolKeys.chromeAiLanguageDetector]: [
    ToolKeys.chromeAiTranslator,
    ToolKeys.chromeAiPrompt,
  ],

  // Web Detection APIs
  [ToolKeys.chromeBarcodeDetector]: [
    ToolKeys.chromeFaceDetector,
    ToolKeys.chromeTextDetector,
    ToolKeys.qrCodeGenerator,
  ],
  [ToolKeys.chromeFaceDetector]: [
    ToolKeys.chromeBarcodeDetector,
    ToolKeys.chromeTextDetector,
  ],
  [ToolKeys.chromeTextDetector]: [
    ToolKeys.chromeBarcodeDetector,
    ToolKeys.chromeFaceDetector,
  ],
};

type ResolvedToolMeta = {
  key: string;
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export default function RelatedToolsBlock() {
  const pathname = usePathname();
  const currentKey = findKey(ToolUrls, (url) => url === pathname);

  if (!currentKey) return null;

  const relatedKeys = RELATED_TOOLS_MAP[currentKey];
  if (!relatedKeys || relatedKeys.length === 0) return null;

  const relatedItems: ResolvedToolMeta[] = [];
  for (const key of relatedKeys) {
    if (key === currentKey) continue;
    const href = get(ToolUrls, key);
    const title = get(ToolTitles, key);
    const description = get(ToolDescriptions, key);
    const icon = get(ToolIcons, key) as LucideIcon | undefined;
    if (!href || !title || !description || !icon) continue;
    relatedItems.push({ key, href, title, description, icon });
  }

  if (relatedItems.length === 0) return null;

  return (
    <section
      aria-labelledby="related-tools-heading"
      className="mt-14 border-t border-slate-200/60 pt-8 text-left dark:border-neutral-800/60"
    >
      <div className="mb-4 flex items-center gap-1.5 text-slate-500 dark:text-neutral-400">
        <Compass
          size={14}
          className="shrink-0 text-sky-500 dark:text-sky-400"
        />
        <h2
          id="related-tools-heading"
          className="text-xs font-semibold uppercase tracking-wider"
        >
          Related Tools
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {relatedItems.map((item) => (
          <RelatedToolItem
            key={item.key}
            href={item.href}
            title={item.title}
            description={item.description}
            icon={item.icon}
          />
        ))}
      </div>
    </section>
  );
}
