import type { Metadata } from 'next';

import CidrCalculator from '@/components/tools/dev-tool/cidr-calculator';
import toolsMetadataUtils from '@/utils/tools/metadata/tools-metadata-utls';
import seoUtils from '@/utils/seo-utils';
import { ToolKeys } from '@/data/tools';

const toolKey = ToolKeys.cidrCalculator;

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
      <CidrCalculator />
    </>
  );
}
