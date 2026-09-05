'use client';

import type { DragEvent, ChangeEvent } from 'react';
import type { FilePickerProps } from './types';

import { Image, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  filePickerDropzoneBaseStyles,
  filePickerIconContainerStyles,
} from './file-picker.variants';

export function FilePicker({
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
}: FilePickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    cancelDefault(event);
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    cancelDefault(event);
    setIsDragging(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    cancelDefault(event);
    const file = event.dataTransfer.files[0];
    onFileChange(file);
    setIsDragging(false);
  };

  const cancelDefault = (event: DragEvent<HTMLDivElement>) => {
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
      className={filePickerDropzoneBaseStyles}
      onClick={onClick}
      onDragEnter={onDragEnter}
      onDragOver={cancelDefault}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-dragging={isDragging}
    >
      <div className={filePickerIconContainerStyles}>
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
