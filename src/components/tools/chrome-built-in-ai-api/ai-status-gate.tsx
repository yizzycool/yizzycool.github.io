'use client';

import type { MouseEventHandler } from 'react';

import type { UnsupportedApiType } from './data/unsupported-types';

import ModelDownloadCard from './model-download-card';
import SystemChecking from './system-checking';
import UnsupportedCard from './unsupported-card';

type Props = {
  hasCheckedAIStatus: boolean;
  isApiSupported: boolean | null;
  apiType: UnsupportedApiType;
  shouldDownloadModel?: boolean;
  downloadProgress?: number | null;
  downloadModel?: MouseEventHandler;
};

export default function AiStatusGate({
  hasCheckedAIStatus,
  isApiSupported,
  apiType,
  shouldDownloadModel = false,
  downloadProgress = null,
  downloadModel,
}: Props) {
  if (!hasCheckedAIStatus) {
    return <SystemChecking />;
  }

  if (!isApiSupported) {
    return <UnsupportedCard apiType={apiType} />;
  }

  if (shouldDownloadModel) {
    return (
      <ModelDownloadCard onClick={downloadModel} progress={downloadProgress} />
    );
  }

  return null;
}
