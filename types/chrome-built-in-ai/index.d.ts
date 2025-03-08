interface Window {
  ai: AI;
}

interface AI {
  readonly translator: AITranslatorFactory;
  readonly languageDetector: AILanguageDetectorFactory;
  readonly summarizer: AISummarizerFactory;
  readonly languageModel: AILanguageModelFactory;
  readonly writer: AIWriterFactory;
  readonly rewriter: AIRewriterFactory;
}

type AICreateMonitorCallback = (monitor: AICreateMonitor) => void;

interface AICreateMonitor extends EventTarget {
  ondownloadprogress: EventHandler;
}

enum AIAvailability {
  Unavailable = 'unavailable',
  Downloadable = 'downloadable',
  Downloading = 'downloading',
  Available = 'available',
}

enum AICapability {
  No = 'no',
  Readily = 'readily',
  AfterDownload = 'after-download',
}

interface AIDestroyable {
  destroy: () => void;
}

interface AIReadableStream<T> {
  [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}
