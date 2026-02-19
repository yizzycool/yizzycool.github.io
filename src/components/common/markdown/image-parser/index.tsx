'use client';

import type { ExtraProps } from 'react-markdown';

import clsx from 'clsx';
import urlJoin from 'url-join';
import { ImageOff } from 'lucide-react';
import {
  AnimatePresence,
  HTMLMotionProps,
  LayoutGroup,
  motion,
} from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import _entries from 'lodash/entries';
import _join from 'lodash/join';

// Tranform `http://localhost:1337/<path>` or `http://127.0.0.1:1337/<path>` to `/strapi/<path>` under production mode
const strapiMediaUrl = process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL;

const hostReg = new RegExp(/^https?:\/\/(localhost|\d+.\d+.\d+.\d+):1337/);

const aligns = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
};

type UrlMetadataType = {
  url: string;
  align: keyof typeof aligns;
  width: number;
  height: number;
};

export default function ImageParser(
  props: React.ComponentPropsWithoutRef<'img'> & ExtraProps
) {
  const { src, node, ...rest } = props;

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Parse image url to get some extra metadata like `align`, `width`, `height`, etc.
  const { url, align, width, height } = useMemo(() => {
    const { origin, pathname, searchParams } = new URL(src || '');

    return {
      url: urlJoin(origin, pathname).replace(hostReg, strapiMediaUrl || ''),
      align: searchParams.get('align') || 'left',
      width: searchParams.get('width')
        ? parseInt(searchParams.get('width') || '0')
        : undefined,
      height: searchParams.get('height')
        ? parseInt(searchParams.get('height') || '0')
        : undefined,
    } as UrlMetadataType;
  }, [src]);

  // Generate unique layoutId to prevent collision
  const imgLayoutId = useMemo(() => {
    const { start, end } = node?.position || {};
    return `${url}-${_join(_entries(start))}-${_join(_entries(end))}`;
  }, [node, url]);

  if (!url)
    return (
      <ImageOff
        size={30}
        strokeWidth={1}
        className={clsx('opacity-50', aligns[align])}
      />
    );

  return (
    <LayoutGroup>
      <motion.img
        src={url}
        {...(rest as Partial<Omit<HTMLMotionProps<'img'>, 'ref'>>)}
        loading="lazy"
        className={clsx('my-0', aligns[align])}
        style={{ width, height }}
        layoutId={imgLayoutId}
        onClick={() => setIsFullscreen(true)}
      />

      <AnimatePresence>
        {isFullscreen && (
          <ImagePopup onClose={() => setIsFullscreen(false)}>
            <motion.img
              src={url}
              {...(rest as Partial<Omit<HTMLMotionProps<'img'>, 'ref'>>)}
              loading="lazy"
              className={clsx(
                'object-contain',
                'max-w-[calc(100vw_-_40px)] md:max-w-[90vw]',
                'max-h-[calc(100dvh_-_40px)] md:max-h-[85dvh]'
              )}
              layoutId={imgLayoutId}
            />
          </ImagePopup>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

type PopupProps = {
  onClose: () => void;
  children: React.ReactNode;
};

function ImagePopup({ onClose, children }: PopupProps) {
  const [body, setBody] = useState<HTMLElement>();

  useEffect(() => {
    setBody(document.body);
  }, []);

  if (!body) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 z-[-1] bg-neutral-900/20 backdrop-blur-md dark:bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      {children}
    </motion.div>,
    body
  );
}
