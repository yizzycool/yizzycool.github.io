'use client';

import { Info, Link } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import Snackbar from '@/components/common/snackbar';
import HeaderBlock from '../../components/header-block';
import SectionGap from '../../components/section-gap';
import useGenerateQrCode from './hooks/use-generate-qrcode';
import SystemStatus from './components/system-status';
import PasteAction from '@/components/common/action-button/paste';
import DeleteAction from '@/components/common/action-button/delete';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import Textarea from '@/components/common/textarea';
import Appearance from './components/appearance';
import Label from '@/components/common/label';
import Layout from './components/layout';
import Preview from './components/preview';
import ActionButtons from './components/action-buttons';

// Handle color preset selection
export const QrCodeColorPresets = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Midnight', fg: '#171717', bg: '#f5f5f5' },
  { name: 'Indigo (Katsuiro)', fg: '#181b39', bg: '#f0f4f8' },
  { name: 'Forest', fg: '#064e3b', bg: '#ecfdf5' },
  { name: 'Matcha (Green Tea)', fg: '#4b5945', bg: '#f2f2e9' },
  { name: 'Zen (Stone)', fg: '#434343', bg: '#dcdcdc' },
  { name: 'Mochi (Toasted)', fg: '#7d6e5d', bg: '#f5f5dc' },
  { name: 'Ocean', fg: '#1e3a8a', bg: '#eff6ff' },
  { name: 'Ocean (Seigaiha)', fg: '#2b5f75', bg: '#e0f2f1' },
  { name: 'Sakura (Cherry Blossom)', fg: '#d08294', bg: '#fdf2f4' },
  { name: 'Autumn (Momiji)', fg: '#9e3d31', bg: '#fffaf0' },
];

export default function QrCodeGenerator() {
  const [inputText, setInputText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [margin, setMargin] = useState(2);
  const [error, setError] = useState(false);

  const { isSystemReady, qrCodeUrl } = useGenerateQrCode({
    text: inputText,
    size,
    color: fgColor,
    bgColor,
    margin,
  });

  const onInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const onClear = () => setInputText('');

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      <SystemStatus isSystemReady={isSystemReady} />

      <SectionGap />

      {/* Input block */}
      <div className="mb-3 flex flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
        <Label htmlFor="url-textarea" icon={Link}>
          Enter URL or Text
        </Label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <PasteAction onClick={setInputText} />
          <DeleteAction
            onClick={onClear}
            disabled={_isNull(inputText) || _isEmpty(inputText)}
          />
        </div>
      </div>
      <Textarea
        id="url-textarea"
        placeholder="Paste the URL or text you want to process here..."
        onChange={onInputChange}
        value={inputText}
        rows={8}
        autoFocus
      />

      <SectionGap />

      {/* Settings */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Appearance
          fgColor={fgColor}
          setFgColor={setFgColor}
          bgColor={bgColor}
          setBgColor={setBgColor}
        />
        <Layout
          size={size}
          setSize={setSize}
          margin={margin}
          setMargin={setMargin}
        />
      </div>

      <SectionGap />

      <Preview qrCodeUrl={qrCodeUrl} inputText={inputText} />

      <SectionGap />

      <ActionButtons qrCodeUrl={qrCodeUrl} />

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
