import type { ComponentType } from 'react';

export type FeaturePanelSide = 'featurePanel' | 'headerToolsSelector';

export type FeaturePanelToolItem = {
  key: string;
  name: string;
  href: string;
  icon: {
    component: ComponentType<{ className?: string }>;
  };
  badge?: string;
};

export type FeaturePanelSubGroup = {
  id: string;
  label: string;
  items: FeaturePanelToolItem[];
};

export type FeaturePanelToolGroup = {
  id: string;
  name: string;
  badge?: string;
  defaultExpanded: boolean;
  items: FeaturePanelToolItem[];
  subGroups?: FeaturePanelSubGroup[];
};
