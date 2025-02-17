'use client';

import Title from '../../components/title';
import SupportTable from '../components/support-table';
import Translator from './components/translator';

export default function TranslatorApi() {
  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Translator</Title>
      <SupportTable />
      <Translator />
    </div>
  );
}
