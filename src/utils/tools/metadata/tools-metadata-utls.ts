import type { Metadata } from 'next';
import { defaultsDeep } from 'lodash';

import { ToolMetadata } from '@/data/tools/metadata';
import dataProcessUtils from '../data/data-process-utils';

const toolsMetadataUtils = {
  generateMetadata: (toolKey: string): Metadata => {
    const url = dataProcessUtils.getToolUrl(toolKey);

    const customMetadata = {
      alternates: {
        canonical: url,
      },
      openGraph: {
        type: 'website',
        url,
      },
      twitter: {
        card: 'summary_large_image',
      },
    };

    return defaultsDeep(customMetadata, ToolMetadata[toolKey]);
  },
};

export default toolsMetadataUtils;
