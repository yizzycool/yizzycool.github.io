'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { defaults, isNull, startsWith, size } from 'lodash';

import useAiCommon from './use-ai-common';
import browserUtils from '@/utils/browser-utils';

const Options: AIWriterCreateOptions = {
  sharedContext: '',
  tone: 'neutral',
  format: 'markdown',
  length: 'short',
};

export default function useAiWriter() {
  const [writer, setWriter] = useState<AIWriter | null>(null);
  const [options, setOptions] = useState(Options);

  const isApiSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const {
    availability,
    setAvailability,
    setError,
    downloadProgress,
    setDownloadProgress,
    hasCheckedAIStatus,
    shouldDownloadModel,
  } = useAiCommon({ isApiSupported });

  const initWriter = async (monitor?: AICreateMonitorCallback | undefined) => {
    if (!window.Writer) return;
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
        const newOptions = defaults(options, Options);
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
    const availability = await window.Writer?.availability?.();
    setAvailability(availability);
  };

  useEffect(() => {
    if (!isApiSupported || typeof window === 'undefined' || !window.Writer)
      return;

    window.Writer.availability?.().then((avail) => {
      setAvailability(avail);
      if (avail === 'available') {
        window.Writer?.create(options)
          .then((inst) => setWriter(inst))
          .catch(() => setError(true));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiSupported, setAvailability, setError]);

  useEffect(() => {
    return () => {
      writer?.destroy?.();
    };
  }, [writer]);

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
        const filteredChunk = startsWith(chunk, prevChunk)
          ? chunk.substring(size(prevChunk))
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
    hasCheckedAIStatus,
    isApiSupported,
    availability,
    options,
    isOptionUpdating: isNull(writer),
    write,
    writeStreaming,
    updateWriter,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  };
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'Writer' in window;
}

function getServerSnapshot() {
  return null;
}
