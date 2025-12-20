import type { Metadata } from 'next';
import Base64ToImage from '@/components/tools/image-tool/base64-to-image';
import { ToolKeys } from '@/data/tools';
import toolsMetadataUtils from '@/utils/tools/metadata/tools-metadata-utls';
import seoUtils from '@/utils/seo-utils';
import _defaultsDeep from 'lodash/defaultsDeep';

const toolKey = ToolKeys.base64ToImage;

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
      <Base64ToImage />
    </>
  );
}
