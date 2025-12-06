import { CameraIcon, Image, Video, Webcam } from 'lucide-react';
import { WebDetectionFileType } from '../result-canvas';
import Button from '@/components/common/button';
import FilePicker from '@/components/common/file-picker';
import _get from 'lodash/get';

type Props = {
  tab: WebDetectionFileType;
  processImage?: (file: File | undefined) => void;
  processVideo?: (file: File | undefined) => void;
  processWebcam?: () => void;
};

export default function Empty({
  tab,
  processImage = () => {},
  processVideo = () => {},
  processWebcam = () => {},
}: Props) {
  const onImageChange = (file: File) => {
    processImage(file);
  };

  const onVideoChange = (file: File) => {
    processVideo(file);
  };

  return (
    <div className="py-8">
      {tab === 'image' ? (
        <FilePicker
          icon={Image}
          title="Upload an image"
          desc="Drag and drop your file here, or click the button below to browse your files."
          onFileChange={onImageChange}
        />
      ) : tab === 'video' ? (
        <FilePicker
          icon={Video}
          title="Upload a video"
          desc="Drag and drop your file here, or click the button below to browse your files."
          onFileChange={onVideoChange}
        />
      ) : (
        <div className="flex flex-col items-center border-2 border-transparent px-4 py-12 sm:px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 text-neutral-400 dark:bg-neutral-700">
            <Webcam size={32} />
          </div>
          <div className="mt-4 w-fit px-8 py-2 text-lg font-bold">
            Use webcam
          </div>
          <div className="max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
            Use your webcam to start detection. Just click when you're ready.
          </div>
          <Button
            onClick={processWebcam}
            size="sm"
            variant="primary"
            icon={CameraIcon}
            className="mt-8"
          >
            Open Webcam
          </Button>
        </div>
      )}
    </div>
  );
}
