import type { Metadata } from 'next';
import JsonFormatter from '@/components/tools/dev-tool/json-formatter';
import { ToolKeys } from '@/data/tools';
import toolsMetadataUtils from '@/utils/tools/metadata/tools-metadata-utls';
import seoUtils from '@/utils/seo-utils';
import _defaultsDeep from 'lodash/defaultsDeep';

const toolKey = ToolKeys.jsonFormatter;

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
      <JsonFormatter />
    </>
  );
}
