import urlJoin from 'url-join';
import { findKey } from 'lodash';

import { ToolGroupItems, ToolGroupSlugs, ToolSlugs } from '@/data/tools';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '';

const dataProcessUtils = {
  getToolGroupKeyByToolKey: (toolKey: string): keyof typeof ToolGroupSlugs => {
    return findKey(ToolGroupItems, (value) =>
      value.includes(toolKey)
    ) as string;
  },
  getToolUrl: (toolKey: string) => {
    const toolGroupKey = dataProcessUtils.getToolGroupKeyByToolKey(toolKey);

    return urlJoin(
      domain,
      'tools',
      ToolGroupSlugs[toolGroupKey],
      ToolSlugs[toolKey]
    );
  },
};

export default dataProcessUtils;
