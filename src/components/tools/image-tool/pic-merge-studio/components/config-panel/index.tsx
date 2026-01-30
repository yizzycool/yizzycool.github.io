'use client';

import type { FabricHelper } from '../../types/fabric-helper';
import type { ConfigHelper } from '../../types/config-helper';

import useWindowDevice from '@/hooks/window/use-window-device';
import ConfigPanelDesktop from './desktop';
import ConfigPanelMobile from './mobile';

type Props = {
  fabricHelper: FabricHelper;
  configHelper: ConfigHelper;
};

export default function ConfigPanel(props: Props) {
  const { isDesktop, isMobile } = useWindowDevice();

  if (isDesktop) {
    return <ConfigPanelDesktop {...props} />;
  } else if (isMobile) {
    return <ConfigPanelMobile {...props} />;
  } else {
    return null;
  }
}
