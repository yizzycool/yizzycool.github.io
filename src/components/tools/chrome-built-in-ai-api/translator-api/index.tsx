'use client';

import { useState } from 'react';
import Title from '../../components/title';
import SupportTable from './components/support-table';
import _get from 'lodash/get';
import _isNull from 'lodash/isNull';

export type TranslatorApiSupportedStatus = {
  translator: boolean | null;
  languageDetector: boolean | null;
};

const DefaultSupportedStatus: TranslatorApiSupportedStatus = {
  translator: null,
  languageDetector: null,
};

export default function TranslatorApi() {
  const [apiSupportedStatus, setApiSupportedStatus] =
    useState<TranslatorApiSupportedStatus>(DefaultSupportedStatus);

  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Translator & Language Detector</Title>
      <SupportTable
        apiSupportedStatus={apiSupportedStatus}
        setApiSupportedStatus={setApiSupportedStatus}
      />
    </div>
  );
}
