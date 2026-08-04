import type { Metadata } from 'next';

import PromptApi from '@/components/tools/chrome-built-in-ai-api/prompt-api';
import OriginTrialMeta from '@/components/layout/origin-trial-meta';
import toolsMetadataUtils from '@/utils/tools/metadata/tools-metadata-utls';
import seoUtils from '@/utils/seo-utils';
import { ToolKeys } from '@/data/tools';

const toolKey = ToolKeys.chromeAiPrompt;

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            seoUtils.generateEachToolBreadcrumbJsonLd(toolKey)
          ),
        }}
      />
      <OriginTrialMeta token="AsLj25lu45kA8i5IstKDVuJem7PtEy0flgVKWKuQX/HwKW7BvXAyC/S/hLn3XdUAhBLdGv0jOzobTyLVEUT+3wMAAABZeyJvcmlnaW4iOiJodHRwczovL3lpenp5cGVhc3kuY29tOjQ0MyIsImZlYXR1cmUiOiJBSVByb21wdEFQSVBhcmFtcyIsImV4cGlyeSI6MTc5MTI0NDgwMH0=" />
      <PromptApi />
    </>
  );
}
