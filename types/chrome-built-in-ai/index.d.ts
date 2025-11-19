interface Window {
  ai: AI;
  Translator: AITranslatorFactory;
  LanguageDetector: AILanguageDetectorFactory;
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

type AIAvailability =
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'available';

type AICapability = 'no' | 'readily' | 'after-download';

interface AIDestroyable {
  destroy: () => void;
}

interface AIReadableStream<T> {
  [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}
