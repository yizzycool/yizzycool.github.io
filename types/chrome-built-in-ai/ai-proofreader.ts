interface AIProofreaderFactory {
  create: (options?: AIProofreaderCreateOptions) => Promise<AIProofreader>;
  availability: (
    options?: AIProofreaderCreateCoreOptions
  ) => Promise<AIAvailability>;
}

interface AIProofreader extends AIDestroyable {
  proofread: (
    input: string,
    options?: AIProofreaderProofreadOptions
  ) => Promise<ProofreadResult>;

  // === Not yet supported ===
  // proofreadStreaming: (
  //   input: string,
  //   options?: AIProofreaderProofreadOptions
  // ) => ReadableStream<ProofreadResult> & AIReadableStream<ProofreadResult>;

  readonly includeCorrectionTypes: boolean;
  readonly includeCorrectionExplanations: boolean;
  readonly correctionExplanationLanguage?: string;

  readonly expectedInputLanguages?: ReadonlyArray<string>;
}

interface AIProofreaderCreateCoreOptions {
  includeCorrectionTypes?: boolean; // default: false
  includeCorrectionExplanations?: boolean; // default: false
  correctionExplanationLanguage?: string;
  expectedInputLanguages?: Array<string>;
}

interface AIProofreaderCreateOptions extends AIProofreaderCreateCoreOptions {
  signal?: AbortSignal;
  monitor?: AICreateMonitorCallback;
}

interface AIProofreaderProofreadOptions {
  signal?: AbortSignal;
}

interface ProofreadResult {
  correctedInput: string;
  corrections: ProofreadCorrection[];
}

interface ProofreadCorrection {
  startIndex: number;
  endIndex: number;
  correction: string;
  type: CorrectionType;
  explanation: string;
}

type CorrectionType =
  | 'spelling'
  | 'punctuation'
  | 'capitalization'
  | 'preposition'
  | 'missing-words'
  | 'grammar';
