'use client';

import { cn } from '@/utils/cn';
import { useRef, useState } from 'react';
import { Image, LucideIcon, Upload } from 'lucide-react';

import { Button } from '../button';

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
      className={cn(
        'group flex w-full cursor-pointer flex-col items-center rounded-2xl px-4 py-12 transition-all duration-300 sm:px-8',
        '[&_*]:pointer-events-none',
        'border-2 border-dashed border-neutral-300/90 hover:border-sky-500/60 dark:border-neutral-700/80 dark:hover:border-sky-500/60',
        'bg-gradient-to-b from-white/80 via-neutral-50/50 to-white/80 backdrop-blur-md hover:bg-white hover:shadow-md',
        'dark:from-neutral-900/80 dark:via-neutral-950/60 dark:to-neutral-900/80 dark:hover:bg-neutral-900',
        'data-[dragging=true]:border-sky-500 data-[dragging=true]:bg-sky-50/50 data-[dragging=true]:dark:bg-sky-950/20'
      )}
      onClick={onClick}
      onDragEnter={onDragEnter}
      onDragOver={cancelDefault}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-dragging={isDragging}
    >
      <div
        className={cn(
          'shadow-2xs pointer-events-none w-fit rounded-2xl bg-neutral-100 p-4 transition-all duration-300 dark:bg-neutral-800',
          'group-hover:scale-110 group-hover:bg-sky-100 group-hover:text-sky-600 dark:group-hover:bg-sky-950/60 dark:group-hover:text-sky-400',
          'data-[dragging=true]:bg-sky-100 data-[dragging=true]:dark:bg-sky-900'
        )}
      >
        <Icon className="h-8 w-8 text-slate-500 transition-colors group-hover:text-sky-600 dark:text-slate-400 dark:group-hover:text-sky-400" />
      </div>
      {!!title && (
        <div className="mt-5 w-fit px-8 text-base font-bold text-slate-800 dark:text-slate-200">
          {title}
        </div>
      )}
      {!!desc && (
        <div className="mt-1.5 max-w-xs text-xs font-light text-slate-500 dark:text-slate-400">
          {desc}
        </div>
      )}
      {/* Button */}
      {showButton && (!!ButtonIcon || !!buttonText) && (
        <Button
          variant="primary"
          size="sm"
          rounded="xl"
          icon={ButtonIcon}
          className="shadow-xs mt-6 font-medium transition-transform group-hover:scale-105"
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
