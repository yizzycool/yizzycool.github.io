'use client';

import Title from '../../components/title';
import SupportTable from '../components/support-table';
import _get from 'lodash/get';
import _isNull from 'lodash/isNull';

export default function LanguageDetectorApi() {
  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Language Detector</Title>
      <SupportTable />
      <div className="min-h-screen" />
    </div>
  );
}
