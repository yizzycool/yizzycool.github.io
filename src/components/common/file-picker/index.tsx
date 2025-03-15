'use client';

import { useMemo, useRef } from 'react';
import { FilePlus, ImagePlus } from 'lucide-react';

export default function FilePicker({
  type = 'image',
  onFileChange = () => {},
}: {
  type: string;
  onFileChange: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const Icon = useMemo(() => {
    if (type === 'image') {
      return ImagePlus;
    }
    return FilePlus;
  }, [type]);

  const desc = useMemo(() => {
    if (type === 'image') {
      return 'Choose an image';
    }
    return 'Choose a file';
  }, [type]);

  // const hint = useMemo(() => {
  //   if (type === 'image') {
  //     return 'or drop an image here';
  //   }
  //   return '';
  // }, [type]);

  const accept = useMemo(() => {
    if (type === 'image') {
      return 'image/*';
    }
    return '*';
  }, [type]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    onFileChange(file);
  };

  return (
    <button
      className="group mt-8 w-full rounded-lg border-2 border-dashed p-12 text-center"
      onClick={() => inputRef.current?.click()}
    >
      <Icon className="mx-auto h-12 w-12" />
      <div className="mx-auto mt-8 w-fit rounded-full bg-sky-500/80 px-8 py-2 text-white transition-all group-hover:bg-sky-500/90">
        {desc}
      </div>
      {/* {hint && <div className="mt-4 font-bold">{hint}</div>} */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
      />
    </button>
  );
}
