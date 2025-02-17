'use client';

import Title from '../../components/title';
import SupportTable from '../components/support-table';
import Summarizer from './components/summarizer';

export default function SummarizerApi() {
  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Summarizer</Title>
      <SupportTable />
      <Summarizer />
    </div>
  );
}
