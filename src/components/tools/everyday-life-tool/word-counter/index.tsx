'use client';

import { Info, TextAlignStart } from 'lucide-react';
import { useState } from 'react';
import { isNull, isEmpty } from 'lodash';

import Snackbar from '@/components/common/snackbar';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import PasteAction from '@/components/common/action-button/paste';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import LabelBar from '../../common/label-bar';
import Tools from './tools';
import Metrics from './metrics';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [error, setError] = useState(false);

  const onClear = () => setText('');

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {/* Input block */}
      <LabelBar
        label="Content Input"
        icon={TextAlignStart}
        htmlFor="input-textarea"
      >
        <PasteAction onClick={setText} />
        <DeleteAction
          onClick={onClear}
          disabled={isNull(text) || isEmpty(text)}
        />
      </LabelBar>
      <Textarea
        id="input-textarea"
        placeholder="Paste your text here to start analysis..."
        onChange={onChange}
        value={text}
        rows={8}
        className="rounded-b-none"
      />
      <Tools setText={setText} />

      <SectionGap />

      <Metrics text={text} />

      {/* Error dialog */}
      <Snackbar
        variant="error"
        open={!!error}
        icon={Info}
        onClose={() => setError(false)}
        content="Invalid JSON format"
      />
    </>
  );
}
