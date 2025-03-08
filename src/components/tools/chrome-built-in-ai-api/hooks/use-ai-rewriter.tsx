'use client';

import { useEffect, useState } from 'react';
import browserUtils from '@/utils/browser-utils';
import _defaults from 'lodash/defaults';
import _isNull from 'lodash/isNull';
import _startsWith from 'lodash/startsWith';
import _size from 'lodash/size';

const Options: AIRewriterCreateOptions = {
  sharedContext: '',
  tone: 'as-is',
  format: 'as-is',
  length: 'as-is',
};

export default function useAiRewriter({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [rewriter, setRewriter] = useState<AIRewriter | null>(null);
  const [options, setOptions] = useState(Options);

  useEffect(() => {
    checkCapability();
  }, []);

  useEffect(() => {
    if (!isSupported || !createInstance) return;
    initRewriter();

    return () => {
      rewriter?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // To check if rewriter is supported
  const checkCapability = () => {
    const rewriter = window.ai?.rewriter;
    setIsSupported(!!rewriter?.availability);
  };

  const initRewriter = async () => {
    if (window.ai?.rewriter) {
      try {
        const rewriter = await window.ai.rewriter.create(options);
        setRewriter(rewriter);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const updateRewriter = async (options: AIRewriterCreateOptions) => {
    if (window.ai?.rewriter) {
      try {
        if (rewriter) rewriter?.destroy?.();
        setRewriter(null);
        await browserUtils.sleep(500);
        const newOptions = _defaults(options, Options);
        const newRewriter = await window.ai.rewriter.create(newOptions);
        setOptions(newOptions);
        setRewriter(newRewriter);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const rewrite = async (text: string): Promise<string | null> => {
    if (!rewriter) return null;
    try {
      const result = await rewriter.rewrite(text);
      return result;
    } catch (e) {
      console.log('rewrite error:', e);
      return null;
    }
  };

  const rewriteStreaming = async (
    text: string,
    callback: (chunk: string) => void
  ): Promise<string | null> => {
    if (!rewriter) return null;
    try {
      let results = '';
      let prevChunk = '';
      const stream = await rewriter.rewriteStreaming(text);
      for await (const chunk of stream) {
        const filteredChunk = _startsWith(chunk, prevChunk)
          ? chunk.substring(_size(prevChunk))
          : chunk;
        callback(filteredChunk);
        results += filteredChunk;
        prevChunk = chunk;
      }
      return results;
    } catch (e) {
      console.log('rewrite streaming error:', e);
      return null;
    }
  };

  return {
    isSupported,
    isPartialUnsupported,
    options,
    isOptionUpdating: _isNull(rewriter),
    rewrite,
    rewriteStreaming,
    updateRewriter,
  };
}
