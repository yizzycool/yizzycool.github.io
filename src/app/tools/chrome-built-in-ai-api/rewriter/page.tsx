import type { Metadata } from 'next';

import RewriterApi from '@/components/tools/chrome-built-in-ai-api/rewriter-api';
import toolsMetadataUtils from '@/utils/tools/metadata/tools-metadata-utls';
import seoUtils from '@/utils/seo-utils';
import { ToolKeys } from '@/data/tools';

const toolKey = ToolKeys.chromeAiRewriter;

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
      <RewriterApi />
    </>
  );
}
