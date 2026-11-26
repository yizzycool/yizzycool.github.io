import type { Metadata } from 'next';

import BakingCookingConverter from '@/components/tools/everyday-life-tool/baking-cooking-converter';
import { ToolKeys } from '@/data/tools';
import seoUtils from '@/utils/seo-utils';
import toolsMetadataUtils from '@/utils/tools/metadata/tools-metadata-utls';

const toolKey = ToolKeys.bakingCookingConverter;

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
      <BakingCookingConverter />
    </>
  );
}
