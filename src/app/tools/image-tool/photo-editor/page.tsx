import type { Metadata } from 'next';

import PhotoEditorStudio from '@/components/tools/image-tool/photo-editor';
import { ToolKeys } from '@/data/tools';
import seoUtils from '@/utils/seo-utils';
import toolsMetadataUtils from '@/utils/tools/metadata/tools-metadata-utls';

const toolKey = ToolKeys.photoEditorStudio;

export const metadata: Metadata = toolsMetadataUtils.generateMetadata(toolKey);

export default function PhotoEditorStudioPage() {
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
      <PhotoEditorStudio />
    </>
  );
}
