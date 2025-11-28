'use client';

import { useEffect, useState } from 'react';
import useAiCommon from './use-ai-common';
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

export default function useAiWriter() {
  const [writer, setWriter] = useState<AIWriter | null>(null);
  const [options, setOptions] = useState(Options);

  const {
    isApiSupported,
    setIsApiSupported,
    availability,
    setAvailability,
    error,
    setError,
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  } = useAiCommon();

  useEffect(() => {
    // Check if API is supported on the device
    const apiExist = !!window.Writer;
    setIsApiSupported(apiExist);
    if (!apiExist) return;
    checkAvailability();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      writer?.destroy?.();
    };
  }, [writer]);

  // To check if writer is supported
  const checkAvailability = async () => {
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.Writer?.availability?.();
    setAvailability(availability);
    if (availability === 'available') {
      initWriter();
    }
  };

  const initWriter = async (monitor?: AICreateMonitorCallback | undefined) => {
    if (!window.Writer) {
      setIsApiSupported(false);
      return;
    }
    try {
      const writer = await window.Writer.create({ ...options, monitor });
      setWriter(writer);
    } catch (_e) {
      setError(true);
    }
  };

  const updateWriter = async (options: AIWriterCreateOptions) => {
    if (window.Writer) {
      try {
        if (writer) writer?.destroy?.();
        setWriter(null);
        await browserUtils.sleep(500);
        const newOptions = _defaults(options, Options);
        const newWriter = await window.Writer.create(newOptions);
        setOptions(newOptions);
        setWriter(newWriter);
      } catch (_e) {
        setError(true);
      }
    }
  };

  const createMonitorCallback: AICreateMonitorCallback = (monitor) => {
    setDownloadProgress(0);
    monitor.addEventListener('downloadprogress', (e) => {
      setDownloadProgress(e.loaded);
      if (e.loaded === 1) {
        setTimeout(() => setDownloadProgress(null), 1000);
      }
    });
  };

  const downloadModel = async () => {
    await initWriter(createMonitorCallback);
    // Check API availability (unavailable / downloadable / downloading / available)
    const availability = await window.Writer?.availability?.();
    setAvailability(availability);
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

  const resetError = () => setError(false);

  return {
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    error,
    options,
    isOptionUpdating: _isNull(writer),
    write,
    writeStreaming,
    updateWriter,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  };
}
