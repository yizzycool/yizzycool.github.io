import type { Metadata } from 'next';
import ProofreaderApi from '@/components/tools/chrome-built-in-ai-api/proofreader-api';
import { ToolKeys } from '@/data/tools';
import toolsMetadataUtils from '@/utils/tools/metadata/tools-metadata-utls';
import seoUtils from '@/utils/seo-utils';
import _defaultsDeep from 'lodash/defaultsDeep';

const toolKey = ToolKeys.chromeAiProofreader;

export const metadata: Metadata = toolsMetadataUtils.generateMetadata(toolKey);

export default function ToolPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateToolJsonLd(toolKey)),
        }}
      />
      <ProofreaderApi />
    </>
  );
}
