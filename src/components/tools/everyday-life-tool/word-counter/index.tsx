'use client';

import { Info, TextAlignStart } from 'lucide-react';
import { useState } from 'react';
import Snackbar from '@/components/common/snackbar';
import HeaderBlock from '../../components/header-block';
import SectionGap from '../../components/section-gap';
import PasteAction from '@/components/common/action-button/paste';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import Label from '@/components/common/label';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import Tools from './components/tools';
import Metrics from './components/metrics';

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
      <div className="mb-3 flex flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
        <Label htmlFor="input-textarea" icon={TextAlignStart}>
          Content Input
        </Label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <PasteAction onClick={setText} />
          <DeleteAction
            onClick={onClear}
            disabled={_isNull(text) || _isEmpty(text)}
          />
        </div>
      </div>
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
