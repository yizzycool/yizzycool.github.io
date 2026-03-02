'use client';

import clsx from 'clsx';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import mermaid, { type MermaidConfig } from 'mermaid';

import useDarkModeObserver from '@/hooks/window/use-dark-mode-observer';

import _defaultsDeep from 'lodash/defaultsDeep';

const defaultConfig = {
  startOnLoad: false,
  theme: 'neutral',
  flowchart: {
    useMaxWidth: false, // default: true, SVG will fit container's size automatically
  },
};

mermaid.initialize(defaultConfig as MermaidConfig);

const aligns = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
};

type UrlMetadataType = {
  look: string;
  align: keyof typeof aligns;
  width: number;
  height: number;
};

type Props = {
  code: string;
  metadata: string; // mermaid?look=<look>&width=<width>&height=<height>
};

export default function MermaidChart({ code, metadata }: Props) {
  const [svg, setSvg] = useState<string>();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { isDark } = useDarkModeObserver();

  const randomLayoutId = useMemo(() => {
    return `mermaid-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Parse query string to get extra metadata like `align`, `width`, `height`, etc.
  const { look, align } = useMemo(() => {
    const params = new URLSearchParams(metadata.replace(/^mermaid/, ''));

    return {
      look: params.get('look') || 'classic',
      align: params.get('align') || 'center',
    } as UrlMetadataType;
  }, [metadata]);

  // 1. Update mermaid config
  // 2. Render mermaid when `code` changed
  useEffect(() => {
    const render = async () => {
      mermaid.initialize(
        _defaultsDeep(
          {
            theme: isDark ? 'dark' : defaultConfig.theme,
            look,
          },
          defaultConfig
        ) as MermaidConfig
      );

      if (!code) return;
      const { svg } = await mermaid.render(
        `mermaid-${Math.random().toString(36).substr(2, 9)}`,
        code
      );
      setSvg(svg);
    };

    render();
  }, [isDark, look, code]);

  if (!svg) return;

  return (
    <LayoutGroup>
      <motion.div
        layoutId={randomLayoutId}
        dangerouslySetInnerHTML={{ __html: svg }}
        onClick={() => setIsFullscreen(true)}
        className={clsx(
          'block max-h-[400px] w-fit max-w-full',
          '*:h-full *:max-h-[400px] *:max-w-full',
          'cursor-zoom-in',
          aligns[align]
        )}
      />

      <AnimatePresence>
        {isFullscreen && (
          <ImagePopup onClose={() => setIsFullscreen(false)}>
            <motion.div
              layoutId={randomLayoutId}
              className={clsx(
                'max-w-[calc(100vw_-_40px)] md:max-w-[90vw]',
                'max-h-[calc(100dvh_-_40px)] md:max-h-[85dvh]',
                '*:h-full *:w-full'
              )}
              dangerouslySetInnerHTML={{ __html: svg }}
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
