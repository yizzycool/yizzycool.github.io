'use client';

import clsx from 'clsx';
import { useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export default function FilePicker({
  type = 'image',
  onFileChange = () => {},
}: {
  type: string;
  onFileChange: (file: File) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const desc = useMemo(() => {
    if (type === 'image') {
      return 'Click to upload';
    }
    return 'Choose a file';
  }, [type]);

  const hint = useMemo(() => {
    if (type === 'image') {
      return 'or drop an image here';
    }
    return '';
  }, [type]);

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

  const onDragEnter = (event: React.DragEvent<HTMLButtonElement>) => {
    cancelDefault(event);
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLButtonElement>) => {
    cancelDefault(event);
    setIsDragging(false);
  };

  const onDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    cancelDefault(event);
    const file = event.dataTransfer.files[0];
    onFileChange(file);
    setIsDragging(false);
  };

  const cancelDefault = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };

  return (
    <button
      className={clsx(
        'group mt-8 w-full rounded-lg p-12 text-center transition-all [&_*]:pointer-events-none',
        'border-2 border-dashed border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600',
        'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50',
        'data-[dragging=true]:scale-[1.01]',
        'data-[dragging=true]:border-neutral-900 data-[dragging=true]:dark:border-neutral-100',
        'data-[dragging=true]:bg-neutral-100 data-[dragging=true]:dark:bg-neutral-900'
      )}
      onClick={() => inputRef.current?.click()}
      onDragEnter={onDragEnter}
      onDragOver={cancelDefault}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-dragging={isDragging}
    >
      <div
        className={clsx(
          'pointer-events-none mx-auto w-fit rounded-full p-4 transition-all',
          'bg-neutral-100 group-hover:scale-110 dark:bg-neutral-800',
          'data-[dragging=true]:bg-neutral-200 data-[dragging=true]:dark:bg-neutral-800'
        )}
      >
        <Upload className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />
      </div>
      <div className="mx-auto mt-4 w-fit px-8 py-2 text-lg font-bold">
        {desc}
      </div>
      {hint && (
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          {hint}
        </div>
      )}
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
