import urlJoin from 'url-join';
import { ToolGroupItems, ToolGroupSlugs, ToolSlugs } from '@/data/tools';
import _findKey from 'lodash/findKey';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '';

const dataProcessUtils = {
  getToolGroupKeyByToolKey: (toolKey: string): keyof typeof ToolGroupSlugs => {
    return _findKey(ToolGroupItems, (value) =>
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
