'use client';

import clsx from 'clsx';
import { useRef, useState } from 'react';
import { Image, LucideIcon, Upload } from 'lucide-react';

import Button from '../button';

type Props = {
  icon?: LucideIcon;
  title?: string;
  desc?: string;
  showButton?: boolean;
  buttonIcon?: LucideIcon;
  buttonText?: string;
  accept?: string;
  multiple?: boolean;
  onFileChange?: (file: File) => void;
  onFilesChange?: (files: FileList) => void;
};

export default function FilePicker({
  icon: Icon = Image,
  title = 'Click to upload',
  desc = 'or drop an image here',
  showButton = true,
  buttonIcon: ButtonIcon = Upload,
  buttonText = 'Choose File',
  accept = 'image/*',
  multiple = false,
  onFileChange = () => {},
  onFilesChange = () => {},
}: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (multiple) {
      const files = event.target.files;
      if (!files || !files.length) return;
      onFilesChange(files);
    } else {
      const file = event.target.files?.[0];
      if (!file) return;
      onFileChange(file);
    }
  };

  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    cancelDefault(event);
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    cancelDefault(event);
    setIsDragging(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    cancelDefault(event);
    const file = event.dataTransfer.files[0];
    onFileChange(file);
    setIsDragging(false);
  };

  const cancelDefault = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };

  const onClick = () => {
    if (inputRef.current?.value) {
      inputRef.current.value = '';
    }
    inputRef.current?.click();
  };

  return (
    <div
      className={clsx(
        'group flex w-full cursor-pointer flex-col items-center rounded-lg px-4 py-12 transition-all sm:px-8',
        '[&_*]:pointer-events-none',
        'border-2 border-dashed border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600',
        'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50',
        'data-[dragging=true]:border-neutral-900 data-[dragging=true]:dark:border-neutral-100',
        'data-[dragging=true]:bg-neutral-100 data-[dragging=true]:dark:bg-neutral-900'
      )}
      onClick={onClick}
      onDragEnter={onDragEnter}
      onDragOver={cancelDefault}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-dragging={isDragging}
    >
      <div
        className={clsx(
          'pointer-events-none w-fit rounded-full bg-neutral-200 p-4 dark:bg-neutral-700',
          'data-[dragging=true]:bg-neutral-200 data-[dragging=true]:dark:bg-neutral-800'
        )}
      >
        <Icon className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />
      </div>
      {!!title && (
        <div className="mt-6 w-fit px-8 text-lg font-bold">{title}</div>
      )}
      {!!desc && (
        <div className="mt-2 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
          {desc}
        </div>
      )}
      {/* Button */}
      {showButton && (!!ButtonIcon || !!buttonText) && (
        <Button
          variant="primary"
          size="sm"
          icon={ButtonIcon}
          className="mt-8 group-hover:scale-110 group-hover:bg-neutral-800 dark:group-hover:bg-neutral-200"
        >
          {buttonText}
        </Button>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}
