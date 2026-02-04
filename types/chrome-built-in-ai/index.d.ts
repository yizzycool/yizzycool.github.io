interface Window {
  // ai: AI;
  Translator: AITranslatorFactory;
  LanguageDetector: AILanguageDetectorFactory;
  Summarizer: AISummarizerFactory;
  Writer: AIWriterFactory;
  Rewriter: AIRewriterFactory;
  LanguageModel: AILanguageModelFactory;
  Proofreader: AIProofreaderFactory;
}

interface AI {
  readonly translator: AITranslatorFactory;
  readonly languageDetector: AILanguageDetectorFactory;
  readonly summarizer: AISummarizerFactory;
  readonly languageModel: AILanguageModelFactory;
  readonly writer: AIWriterFactory;
  readonly rewriter: AIRewriterFactory;
  readonly proofreader: AIProofreaderFactory;
}

type AICreateMonitorCallback = (monitor: AICreateMonitor) => void;

interface AICreateMonitor extends EventTarget {
  ondownloadprogress:
    | ((this: AICreateMonitor, event: ProgressEvent) => void)
    | null;
  addEventListener<T extends keyof AICreateMonitorEventMap>(
    type: T,
    listener: (
      this: AICreateMonitor,
      event: AICreateMonitorEventMap[T]
    ) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<T extends keyof AICreateMonitorEventMap>(
    type: T,
    listener: (
      this: AICreateMonitor,
      event: AICreateMonitorEventMap[T]
    ) => void,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface AICreateMonitorEventMap {
  downloadprogress: ProgressEvent;
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
