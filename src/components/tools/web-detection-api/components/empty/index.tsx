import clsx from 'clsx';
import { Camera, FileImage, FilePlus, FileVideo } from 'lucide-react';
import { useRef } from 'react';

type Props = {
  isEmpty?: boolean;
  isCameraOpened?: boolean;
  disabled?: {
    image?: boolean;
    video?: boolean;
    webcam?: boolean;
  };
  processImage?: (file: File | undefined) => void;
  processVideo?: (file: File | undefined) => void;
  processWebcam?: () => void;
};

export default function Empty({
  isEmpty = true,
  isCameraOpened = false,
  disabled = {},
  processImage = () => {},
  processVideo = () => {},
  processWebcam = () => {},
}: Props) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    processImage(file);
  };

  const onVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    processVideo(file);
  };

  return (
    <div className="mt-10 flex flex-col items-center px-5 py-20">
      {isEmpty && (
        <>
          <FilePlus className="h-12 w-12" />
          <div className="mt-4 font-bold">No Result</div>
          <div className="mb-20 mt-2 text-neutral-700/50 dark:text-neutral-300/50">
            Get started by select a new image or video.
          </div>
        </>
      )}
      {!disabled.image && (
        <>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="mt-4 flex items-center rounded-md bg-sky-700 px-4 py-2 hover:bg-sky-700/80"
          >
            <FileImage className="mr-4 h-5 w-5" />
            Choose an image
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />
        </>
      )}
      {!disabled.video && (
        <>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="mt-4 flex items-center rounded-md bg-sky-700 px-4 py-2 hover:bg-sky-700/80"
          >
            <FileVideo className="mr-4 h-5 w-5" />
            Choose a video
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={onVideoChange}
          />
        </>
      )}
      {!disabled.webcam && (
        <button
          className={clsx(
            'mt-4 flex items-center rounded-md bg-sky-700 px-4 py-2 hover:bg-sky-700/80',
            'data-[camera-opened=true]:bg-red-700 data-[camera-opened=true]:hover:bg-red-700/80'
          )}
          onClick={processWebcam}
          data-camera-opened={isCameraOpened}
        >
          <Camera className="mr-4 h-5 w-5" />
          {isCameraOpened ? 'Close webcam' : 'Detect with webcam'}
        </button>
      )}
    </div>
  );
}
