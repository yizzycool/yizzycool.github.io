'use client';

import type { TdxCamera } from '.';

import { MapPin, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { cn } from '@/utils/cn';
import Button from '@/components/common/button';
import CctvPlayer from './cctv-player';

type Props = {
  selectedCamera: TdxCamera | null;
  onSelectCamera: (cam: TdxCamera | null) => void;
};

export default function VideoPreview({
  selectedCamera,
  onSelectCamera,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const name = useMemo(() => {
    if (!selectedCamera) {
      return '';
    }

    const { SurveillanceDescription, RoadSection } = selectedCamera;
    const { Start, End } = RoadSection || {};

    if (SurveillanceDescription) {
      return SurveillanceDescription;
    } else if (Start && End) {
      if (Start === End) {
        return Start;
      }
      return `${Start} - ${End}`;
    }
    return '';
  }, [selectedCamera]);

  useEffect(() => {
    if (!selectedCamera) {
      setIsModalOpen(false);
    }
  }, [selectedCamera]);

  const handleClickCloseButton = () => {
    if (isModalOpen) {
      setIsModalOpen(false);
    } else {
      onSelectCamera(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {selectedCamera && (
          <motion.div
            layout
            variants={cardVariants}
            initial="initial"
            animate={isModalOpen ? 'modal' : 'floating'}
            exit="initial"
            className={cn(
              'fixed z-[9999] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] backdrop-blur-3xl',
              'border-neutral-200 dark:border-neutral-800',
              'bg-white/50 dark:bg-neutral-900/10',
              isModalOpen
                ? 'inset-0 max-w-full'
                : 'bottom-[2rem] right-[1rem] w-full max-w-[min(36rem,_calc(100vw_-_2rem))] lg:bottom-[4rem] lg:right-[2rem]'
            )}
          >
            {/* Close Button */}
            <motion.button
              layout
              onClick={handleClickCloseButton}
              className={cn(
                'absolute z-10 rounded-full p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800',
                isModalOpen
                  ? 'right-3 top-3 lg:right-6 lg:top-6'
                  : 'right-2 top-2'
              )}
            >
              <X className="h-5 w-5 text-neutral-400" />
            </motion.button>

            {/* Modal */}
            <motion.div
              layout
              className={cn(
                'flex max-h-full',
                isModalOpen
                  ? 'flex-col-reverse p-4 pt-12 lg:p-20'
                  : 'flex-col sm:flex-row'
              )}
            >
              {/* CCTV Block */}
              <motion.div
                layout
                className={cn(
                  'relative aspect-video w-full overflow-hidden bg-black',
                  isModalOpen ? '' : 'sm:w-1/2'
                )}
              >
                <CctvPlayer cam={selectedCamera} isModalOpen={isModalOpen} />
                {/* Mask */}
                {!isModalOpen && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                )}
              </motion.div>

              <motion.div
                layout
                className={cn(
                  'flex flex-1 flex-col justify-between gap-4 text-left sm:w-1/2',
                  isModalOpen ? 'p-2 lg:p-4' : 'p-6'
                )}
              >
                <div className="flex items-start justify-between">
                  <motion.div layout className="w-full">
                    <h3 className="mb-1 truncate text-lg font-bold leading-tight tracking-tight text-neutral-900 dark:text-neutral-100">
                      {name}
                    </h3>
                    {selectedCamera.groupName && (
                      <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-400">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {selectedCamera.groupName} - {selectedCamera.RoadName}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>

                <AnimatePresence>
                  {!isModalOpen && (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Button
                        variant="blue"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full"
                      >
                        觀看即時影像
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const cardVariants = {
  initial: {
    y: 100,
    opacity: 0,
  },
  floating: {
    y: 0,
    opacity: 1,
    borderRadius: '1.5rem',
    borderWidth: '1px',
  },
  modal: {
    y: 0,
    opacity: 1,
  },
};
