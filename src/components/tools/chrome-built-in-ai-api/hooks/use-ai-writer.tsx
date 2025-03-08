'use client';

import { useEffect, useState } from 'react';
import browserUtils from '@/utils/browser-utils';
import _defaults from 'lodash/defaults';
import _isNull from 'lodash/isNull';
import _startsWith from 'lodash/startsWith';
import _size from 'lodash/size';

const Options: AIWriterCreateOptions = {
  sharedContext: '',
  tone: 'neutral',
  format: 'markdown',
  length: 'short',
};

export default function useAiWriter({ createInstance = true } = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPartialUnsupported, setIsPartialUnsupported] = useState<
    boolean | null
  >(null);
  const [writer, setWriter] = useState<AIWriter | null>(null);
  const [options, setOptions] = useState(Options);

  useEffect(() => {
    checkCapability();
  }, []);

  useEffect(() => {
    if (!isSupported || !createInstance) return;
    initWriter();

    return () => {
      writer?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // To check if writer is supported
  const checkCapability = () => {
    const writer = window.ai?.writer;
    setIsSupported(!!writer?.availability);
  };

  const initWriter = async () => {
    if (window.ai?.writer) {
      try {
        const writer = await window.ai.writer.create(options);
        setWriter(writer);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const updateWriter = async (options: AIWriterCreateOptions) => {
    if (window.ai?.writer) {
      try {
        if (writer) writer?.destroy?.();
        setWriter(null);
        await browserUtils.sleep(500);
        const newOptions = _defaults(options, Options);
        const newWriter = await window.ai.writer.create(newOptions);
        setOptions(newOptions);
        setWriter(newWriter);
        setIsPartialUnsupported(false);
      } catch (_e) {
        setIsPartialUnsupported(true);
      }
    }
  };

  const write = async (text: string): Promise<string | null> => {
    if (!writer) return null;
    try {
      const result = await writer.write(text);
      return result;
    } catch (e) {
      console.log('write error:', e);
      return null;
    }
  };

  const writeStreaming = async (
    text: string,
    callback: (chunk: string) => void
  ): Promise<string | null> => {
    if (!writer) return null;
    try {
      let results = '';
      let prevChunk = '';
      const stream = await writer.writeStreaming(text);
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
      console.log('write streaming error:', e);
      return null;
    }
  };

  return {
    isSupported,
    isPartialUnsupported,
    options,
    isOptionUpdating: _isNull(writer),
    write,
    writeStreaming,
    updateWriter,
  };
}
