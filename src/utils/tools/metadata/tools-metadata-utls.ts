import type { Metadata } from 'next';
import { ToolMetadata } from '@/data/tools/metadata';
import dataProcessUtils from '../data/data-process-utils';
import _defaultsDeep from 'lodash/defaultsDeep';
import _findKey from 'lodash/findKey';

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

    return _defaultsDeep(customMetadata, ToolMetadata[toolKey]);
  },
};

export default toolsMetadataUtils;
