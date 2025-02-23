'use client';

import Title from '../../components/title';
import SupportTable from '../components/support-table';
import Prompt from './components/prompt';

export default function PromptApi() {
  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Gemini Nano (Prompt API)</Title>
      <SupportTable />
      <Prompt />
    </div>
  );
}
