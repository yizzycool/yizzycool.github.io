'use client';

import type { TdxCamera } from '..';

import { useState, useMemo, useEffect } from 'react';
import { Circle, LoaderCircle, Pause, RotateCcw, X } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/utils/cn';
import FlvPlayer from './flv-player';
import Button from '@/components/common/button';

type Props = {
  cam: TdxCamera;
  isModalOpen: boolean;
};

export default function CctvPlayer({ cam, isModalOpen }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  const VideoComponent = useMemo(() => {
    if (cam.VideoStreamURL) {
      if (
        cam.VideoStreamURL.startsWith(
          'https://atis.ntpc.gov.tw/ATIS/ShowFrame4CCTV/'
        )
      ) {
        return FlvPlayer;
      }
    }
    return FlvPlayer;
  }, [cam.VideoStreamURL, cam.VideoImageURL]);

  useEffect(() => {
    if (!cam.VideoStreamURL && !cam.VideoImageURL) return;
    setIsLoading(false);
    setIsPlaying(false);
    setError(false);
  }, [cam.VideoStreamURL, cam.VideoImageURL]);

  const handleChangeLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleChangePlaying = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const handleSetError = (error: boolean) => {
    setError(error);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {error ? (
        <motion.div
          layout
          className={cn(
            'flex h-full w-full items-center justify-center gap-2 p-4 text-red-400',
            isModalOpen ? '' : 'text-xs'
          )}
        >
          <X /> 該路口影像暫時無法連線
          {isModalOpen && (
            <Button
              variant="ghost"
              size="xs"
              rounded="full"
              icon={RotateCcw}
              className="absolute bottom-2 right-2"
              onClick={() => setError(false)}
            >
              再試一次
            </Button>
          )}
        </motion.div>
      ) : (
        <>
          {isLoading ? (
            // Loading status
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <LoaderCircle
                className={cn(
                  'animate-spin',
                  isModalOpen ? 'h-10 w-10' : 'h-3 w-3'
                )}
              />
            </div>
          ) : (
            // Playing status
            <div
              className={cn(
                'pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-black',
                isPlaying
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-zinc-800 text-zinc-500'
              )}
            >
              {isPlaying ? (
                <Circle
                  width={8}
                  height={8}
                  fill="currentColor"
                  className="animate-pulse"
                />
              ) : (
                <Pause width={10} height={10} fill="currentColor" />
              )}
              {isPlaying ? 'LIVE' : 'IDLE'}
            </div>
          )}
          <VideoComponent
            cam={cam}
            onLoadingChange={handleChangeLoading}
            onPlayingChange={handleChangePlaying}
            onError={() => handleSetError(true)}
          />
        </>
      )}
    </div>
  );
}
