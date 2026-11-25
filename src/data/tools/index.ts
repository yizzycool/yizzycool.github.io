/**
 * Keep this file as a Server Component because it is imported by @/src/app/sitemap.ts,
 * and only Server Components can be imported in that context.
 */

import {
  ArrowLeftRight,
  Binary,
  Bot,
  CaseUpper,
  Clock,
  CodeXml,
  FileArchive,
  FileImage,
  FileText,
  Fingerprint,
  FolderArchive,
  Image,
  Keyboard,
  KeyRound,
  Languages,
  Layers,
  Network,
  Palette,
  PenTool,
  QrCode,
  Radar,
  ReceiptText,
  RefreshCcw,
  Regex,
  ScanFace,
  ShieldCheck,
  Signature,
  SpellCheck,
  StickyNote,
  WandSparkles,
  Wifi,
} from 'lucide-react';
import { fromPairs, findKey } from 'lodash';

// Tool Groups

/**
 * Unique identifier keys for top-level tool category groups.
 */
export const ToolGroupKeys = {
  everydayLifeTool: 'everydayLifeTool',
  devTool: 'devTool',
  imgTool: 'imgTool',
  chromeAiApi: 'chromeAiApi',
  webDetectorApi: 'webDetectorApi',
};

/**
 * Canonical display order of tool groups across the All Tools overview and FeaturePanel sidebar.
 */
export const ToolGroupKeysOrder = [
  ToolGroupKeys.everydayLifeTool,
  ToolGroupKeys.imgTool,
  ToolGroupKeys.devTool,
  ToolGroupKeys.chromeAiApi,
  ToolGroupKeys.webDetectorApi,
];

/**
 * Human-readable display names for each tool category group.
 */
export const ToolGroupNames = {
  [ToolGroupKeys.everydayLifeTool]: 'Everyday Life Tools',
  [ToolGroupKeys.devTool]: 'Developer Tools',
  [ToolGroupKeys.imgTool]: 'Image Tools',
  [ToolGroupKeys.chromeAiApi]: 'Chrome AI APIs',
  [ToolGroupKeys.webDetectorApi]: 'Web Detector APIs',
};

/**
 * URL path segments for each tool category group (used to build `/tools/<group-slug>/<tool-slug>`).
 */
export const ToolGroupSlugs = {
  [ToolGroupKeys.everydayLifeTool]: 'everyday-life-tool',
  [ToolGroupKeys.devTool]: 'dev-tool',
  [ToolGroupKeys.imgTool]: 'image-tool',
  [ToolGroupKeys.chromeAiApi]: 'chrome-built-in-ai-api',
  [ToolGroupKeys.webDetectorApi]: 'web-detection-api',
};

// Tools

/**
 * Unique identifier keys for all registered tools across every category.
 */
export const ToolKeys = {
  // Everyday Life Tools
  expenseSplitter: 'expenseSplitter',
  markdownNotes: 'markdownNotes',
  signatureStampMaker: 'signatureStampMaker',
  qrCodeGenerator: 'qrCodeGenerator',
  wifiCardGenerator: 'wifiCardGenerator',
  wordCounter: 'wordCounter',
  keyCard: 'keyCard',

  // Developer Tools
  urlEncoderDecoder: 'urlEncoderDecoder',
  base64EncoderDecoder: 'base64EncoderDecoder',
  jsonFormatter: 'jsonFormatter',
  unixTimestampConverter: 'unixTimestampConverter',
  regexTester: 'regexTester',
  hashGenerator: 'hashGenerator',
  uuidGenerator: 'uuidGenerator',
  colorConverter: 'colorConverter',
  jwtDebugger: 'jwtDebugger',
  zipExtractor: 'zipExtractor',
  gzipExtractor: 'gzipExtractor',
  htmlEntities: 'htmlEntities',
  hexBinaryConverter: 'hexBinaryConverter',
  cidrCalculator: 'cidrCalculator',

  // Image Tools
  photoEditorStudio: 'photoEditorStudio',
  picMergeStudio: 'picMergeStudio',
  base64ToImage: 'base64ToImage',
  imageToBase64: 'imageToBase64',

  // Chrome AI APIs
  chromeAiTranslator: 'chromeAiTranslator',
  chromeAiLanguageDetector: 'chromeAiLanguageDetector',
  chromeAiSummarizer: 'chromeAiSummarizer',
  chromeAiWriter: 'chromeAiWriter',
  chromeAiRewriter: 'chromeAiRewriter',
  chromeAiPrompt: 'chromeAiPrompt',
  chromeAiProofreader: 'chromeAiProofreader',

  // Web Detector APIs
  chromeFaceDetector: 'chromeFaceDetector',
  chromeBarcodeDetector: 'chromeBarcodeDetector',
  chromeTextDetector: 'chromeTextDetector',
};

/**
 * Tools that require server-side processing or external cloud APIs.
 * Tools listed here will NOT display the "100% Private" badge in AboutBlock.
 */
export const NON_CLIENT_SIDE_TOOLS: string[] = [
  // Add tools that upload data or require external cloud APIs here
];

/**
 * Flat ordered mapping from each tool group to its member tool keys.
 * Serves as the single source of truth for URLs, All Tools overview, sitemap, and search index.
 */
export const ToolGroupItems = {
  [ToolGroupKeys.everydayLifeTool]: [
    ToolKeys.expenseSplitter,
    ToolKeys.markdownNotes,
    ToolKeys.signatureStampMaker,
    ToolKeys.qrCodeGenerator,
    ToolKeys.wifiCardGenerator,
    ToolKeys.wordCounter,
    ToolKeys.keyCard,
  ],
  [ToolGroupKeys.imgTool]: [
    ToolKeys.photoEditorStudio,
    ToolKeys.picMergeStudio,
    ToolKeys.imageToBase64,
    ToolKeys.base64ToImage,
  ],
  [ToolGroupKeys.devTool]: [
    // High-frequency core dev tools
    ToolKeys.jsonFormatter,
    ToolKeys.jwtDebugger,
    ToolKeys.urlEncoderDecoder,
    ToolKeys.base64EncoderDecoder,
    ToolKeys.regexTester,
    ToolKeys.unixTimestampConverter,
    ToolKeys.uuidGenerator,
    ToolKeys.hashGenerator,
    ToolKeys.colorConverter,
    ToolKeys.htmlEntities,

    // Archive inspection, network & binary utilities
    ToolKeys.zipExtractor,
    ToolKeys.gzipExtractor,
    ToolKeys.cidrCalculator,
    ToolKeys.hexBinaryConverter,
  ],
  [ToolGroupKeys.chromeAiApi]: [
    ToolKeys.chromeAiPrompt,
    ToolKeys.chromeAiTranslator,
    ToolKeys.chromeAiSummarizer,
    ToolKeys.chromeAiProofreader,
    ToolKeys.chromeAiWriter,
    ToolKeys.chromeAiRewriter,
    ToolKeys.chromeAiLanguageDetector,
  ],
  [ToolGroupKeys.webDetectorApi]: [
    ToolKeys.chromeBarcodeDetector,
    ToolKeys.chromeTextDetector,
    ToolKeys.chromeFaceDetector,
  ],
};

/**
 * Full display titles for tools used in page headers, tool cards, and SEO metadata.
 */
export const ToolTitles = {
  [ToolKeys.expenseSplitter]: 'Expense Splitter',
  [ToolKeys.markdownNotes]: 'Markdown Notes',
  [ToolKeys.signatureStampMaker]: 'Signature & Stamp Maker',
  [ToolKeys.qrCodeGenerator]: 'QR Code Generator',
  [ToolKeys.wifiCardGenerator]: 'Wi-Fi Card Generator',
  [ToolKeys.wordCounter]: 'Word Counter',
  [ToolKeys.keyCard]: 'KeyCard',

  [ToolKeys.urlEncoderDecoder]: 'URL Encoder / Decoder',
  [ToolKeys.base64EncoderDecoder]: 'Base64 Encoder / Decoder',
  [ToolKeys.jsonFormatter]: 'JSON Formatter',
  [ToolKeys.unixTimestampConverter]: 'Unix Timestamp Converter',
  [ToolKeys.regexTester]: 'Regular Expression Tester',
  [ToolKeys.hashGenerator]: 'Hash Generator',
  [ToolKeys.uuidGenerator]: 'UUID / Token Generator',
  [ToolKeys.colorConverter]: 'Color Space Converter',
  [ToolKeys.jwtDebugger]: 'JWT Debugger',
  [ToolKeys.zipExtractor]: 'ZIP Extractor & Inspector',
  [ToolKeys.gzipExtractor]: 'GZIP Extractor & Inspector',
  [ToolKeys.htmlEntities]: 'HTML Entities Encoder / Decoder',
  [ToolKeys.hexBinaryConverter]: 'Hex / Binary Data Converter',
  [ToolKeys.cidrCalculator]: 'CIDR & Subnet Calculator',

  [ToolKeys.photoEditorStudio]: 'Photo Editor Studio',
  [ToolKeys.picMergeStudio]: 'PicMerge Studio',
  [ToolKeys.base64ToImage]: 'Base64 to Image',
  [ToolKeys.imageToBase64]: 'Image to Base64',

  [ToolKeys.chromeAiTranslator]: 'AI Translator',
  [ToolKeys.chromeAiLanguageDetector]: 'AI Language Detector',
  [ToolKeys.chromeAiSummarizer]: 'AI Summarizer',
  [ToolKeys.chromeAiWriter]: 'AI Writer',
  [ToolKeys.chromeAiRewriter]: 'AI Rewriter',
  [ToolKeys.chromeAiPrompt]: 'AI Chat',
  [ToolKeys.chromeAiProofreader]: 'AI Proofreader',

  [ToolKeys.chromeBarcodeDetector]: 'Barcode Detector',
  [ToolKeys.chromeFaceDetector]: 'Face Detector',
  [ToolKeys.chromeTextDetector]: 'Text Detector',
};

/**
 * Concise single-line tool titles tailored for the narrower FeaturePanel sidebar.
 */
const ToolTitlesForFeaturePanel = {
  ...ToolTitles,

  // Developer Tools - Concise single-line titles with unified naming rhythm
  [ToolKeys.zipExtractor]: 'ZIP Extractor',
  [ToolKeys.gzipExtractor]: 'GZIP Extractor',
  [ToolKeys.hexBinaryConverter]: 'Hex / Binary Converter',
  [ToolKeys.htmlEntities]: 'HTML Entities',
  [ToolKeys.hashGenerator]: 'Hash Generator',
  [ToolKeys.uuidGenerator]: 'UUID Generator',
  [ToolKeys.unixTimestampConverter]: 'Unix Timestamp',
  [ToolKeys.regexTester]: 'Regex Tester',
  [ToolKeys.colorConverter]: 'Color Converter',
  [ToolKeys.cidrCalculator]: 'CIDR Calculator',
};

/**
 * Short tool descriptions displayed in tool cards, headers, and search results.
 */
export const ToolDescriptions = {
  [ToolKeys.expenseSplitter]:
    'Split group bills and travel expenses fairly with the Min-Cash-Flow debt simplification algorithm and 1-click LINE / chat summary export.',
  [ToolKeys.markdownNotes]:
    'Keep-style sticky notes board with full Markdown support, interactive checklists, blurred study spoilers, Google Keep Takeout import, and optional Chrome on-device AI.',
  [ToolKeys.signatureStampMaker]:
    '100% local electronic signature pad, transparent stamp maker, and paper photo background remover with Trackpad Mode, shadow normalization, auto-trim PNG/SVG export, and zero uploads.',
  [ToolKeys.qrCodeGenerator]:
    'Generate custom QR codes instantly with personalized colors, contrast presets, adjustable error correction, and 1-click PNG export.',
  [ToolKeys.wifiCardGenerator]:
    'Create printable Wi-Fi QR code guest cards and table tents with Nordic, cafe, dark, and botanical themes, password masking, dashed cut guides, PNG export, and 100% browser privacy.',
  [ToolKeys.wordCounter]:
    'Accurately count words, characters, and UTF-8 bytes for Chinese and English text, with real-time social media limits and text formatting tools.',
  [ToolKeys.keyCard]:
    'Create and manage custom cheat sheets for any topic. Dynamically add data, customize keyword tags, and assign personalized keyboard shortcuts for quick reference.',

  [ToolKeys.urlEncoderDecoder]:
    'Encode or decode URLs and inspect query parameters in an interactive table for seamless debugging and safe web data transmission.',
  [ToolKeys.base64EncoderDecoder]:
    'Encode and decode text to Standard Base64 and URL-safe Base64URL with 100% UTF-8 Unicode support and instant format difference comparisons.',
  [ToolKeys.jsonFormatter]:
    'Format, minify, and explore JSON data with an interactive tree view and instant syntax validation.',
  [ToolKeys.unixTimestampConverter]:
    'Convert Unix epoch timestamps to human-readable dates and back, featuring real-time clock tracking and multi-timezone support.',
  [ToolKeys.regexTester]:
    'Test and debug regular expressions in real time with instant match highlighting, capture group inspection, and a built-in regex cheat sheet.',
  [ToolKeys.hashGenerator]:
    'Generate cryptographic hashes and HMAC checksums (MD5, SHA-1, SHA-256, SHA-384, SHA-512) for text and files with instant target hash matching.',
  [ToolKeys.uuidGenerator]:
    'Generate cryptographically secure UUIDs (v4, v7), NanoIDs, ULIDs, and random tokens with custom lengths, alphabets, and batch export.',
  [ToolKeys.colorConverter]:
    'Convert colors seamlessly across HEX, RGB, HSL, HSV, CMYK, CSS OKLCH, and CIE LAB with instant WCAG 2.1 contrast ratio analysis.',
  [ToolKeys.jwtDebugger]:
    'Decode, inspect, and validate JSON Web Tokens (JWT) in real time with automatic expiration countdown, claims breakdown, and 100% client-side privacy.',
  [ToolKeys.zipExtractor]:
    'Inspect, explore file trees, preview code and images, and extract ZIP archives locally in your browser with 100% client-side privacy.',
  [ToolKeys.gzipExtractor]:
    'Decompress, inspect headers, explore tarball directory trees, preview files, and extract GZIP (.gz, .tgz) archives and streams locally with 100% privacy.',
  [ToolKeys.htmlEntities]:
    'Encode and decode HTML entities with support for standard named entities, full Unicode support, and instant reciprocal swapping.',
  [ToolKeys.hexBinaryConverter]:
    'Convert text, Hex (Base16), binary (0/1), and byte values reciprocally with UTF-8 support, customizable delimiters, and programming export (C Array, Python bytes).',
  [ToolKeys.cidrCalculator]:
    'Calculate subnet masks, usable IP ranges, wildcard masks, and visual 32-bit bit distribution for IPv4 CIDR blocks 100% locally.',

  [ToolKeys.photoEditorStudio]:
    'Free desktop-class Fabric.js v7 photo editor with layers, 16 blend modes, WebGL color filters, clipping masks, brushes, vector shapes, SVG/PNG export, and portable .pes projects.',
  [ToolKeys.picMergeStudio]:
    'Combine photos into custom collages with social media canvas presets, layer controls, filters, and high-resolution export in PNG or JPEG.',
  [ToolKeys.base64ToImage]:
    'Instantly convert Base64 strings back into images, supporting multiple formats for fast preview and verification.',
  [ToolKeys.imageToBase64]:
    'Upload any image and convert it into a Base64 string — perfect for frontend development, API testing, and embedding assets in HTML.',

  [ToolKeys.chromeAiTranslator]:
    'Translate text instantly using Chrome’s built-in Gemini AI, offering fast, accurate, and setup-free multilingual translation.',
  [ToolKeys.chromeAiLanguageDetector]:
    'Automatically detect the language of any text with Chrome’s built-in AI, ideal for multilingual applications and text analysis.',
  [ToolKeys.chromeAiSummarizer]:
    'Generate concise summaries from long text using Chrome’s built-in AI, helping you capture key ideas and save reading time.',
  [ToolKeys.chromeAiWriter]:
    'Create natural, high-quality content with Chrome’s built-in AI, including paragraphs, articles, marketing copy, and more.',
  [ToolKeys.chromeAiRewriter]:
    'Rewrite and enhance existing text using Chrome’s built-in AI to improve clarity, tone, flow, and readability while preserving meaning.',
  [ToolKeys.chromeAiPrompt]:
    'Run AI prompts directly through Chrome’s built-in models, enabling fast, local AI inference with minimal setup for developers.',
  [ToolKeys.chromeAiProofreader]:
    'Instantly proofread and correct text using Chrome’s built-in AI, including grammar, spelling, punctuation, and style improvements—all on-device and fast.',

  [ToolKeys.chromeFaceDetector]:
    'Detect faces in images instantly using Chrome’s built-in face detection API—ideal for camera apps, interactive features, and security applications.',
  [ToolKeys.chromeBarcodeDetector]:
    'Quickly scan and decode QR codes and various barcode formats with Chrome’s built-in barcode detection API.',
  [ToolKeys.chromeTextDetector]:
    'Extract text from images with Chrome’s built-in text detection API, supporting OCR tasks, data extraction, and automation workflows.',
};

/**
 * URL path slugs for individual tools.
 */
export const ToolSlugs = {
  [ToolKeys.expenseSplitter]: 'expense-splitter',
  [ToolKeys.markdownNotes]: 'markdown-notes',
  [ToolKeys.signatureStampMaker]: 'signature-stamp-maker',
  [ToolKeys.qrCodeGenerator]: 'qr-code-generator',
  [ToolKeys.wifiCardGenerator]: 'wifi-card-generator',
  [ToolKeys.wordCounter]: 'word-counter',
  [ToolKeys.keyCard]: 'key-card',

  [ToolKeys.urlEncoderDecoder]: 'url-encoder-decoder',
  [ToolKeys.base64EncoderDecoder]: 'base64-encoder-decoder',
  [ToolKeys.jsonFormatter]: 'json-formatter',
  [ToolKeys.unixTimestampConverter]: 'unix-timestamp-converter',
  [ToolKeys.regexTester]: 'regex-tester',
  [ToolKeys.hashGenerator]: 'hash-generator',
  [ToolKeys.uuidGenerator]: 'uuid-generator',
  [ToolKeys.colorConverter]: 'color-converter',
  [ToolKeys.jwtDebugger]: 'jwt-debugger',
  [ToolKeys.zipExtractor]: 'zip-extractor',
  [ToolKeys.gzipExtractor]: 'gzip-extractor',
  [ToolKeys.htmlEntities]: 'html-entities-encoder-decoder',
  [ToolKeys.hexBinaryConverter]: 'hex-binary-converter',
  [ToolKeys.cidrCalculator]: 'cidr-calculator',

  [ToolKeys.photoEditorStudio]: 'photo-editor',
  [ToolKeys.picMergeStudio]: 'pic-merge-studio',
  [ToolKeys.base64ToImage]: 'base64-to-image',
  [ToolKeys.imageToBase64]: 'image-to-base64',

  [ToolKeys.chromeAiTranslator]: 'translator',
  [ToolKeys.chromeAiLanguageDetector]: 'language-detector',
  [ToolKeys.chromeAiSummarizer]: 'summarizer',
  [ToolKeys.chromeAiWriter]: 'writer',
  [ToolKeys.chromeAiRewriter]: 'rewriter',
  [ToolKeys.chromeAiPrompt]: 'prompt',
  [ToolKeys.chromeAiProofreader]: 'proofreader',

  [ToolKeys.chromeBarcodeDetector]: 'barcode-detector',
  [ToolKeys.chromeFaceDetector]: 'face-detector',
  [ToolKeys.chromeTextDetector]: 'text-detector',
};

/**
 * Derived lookup mapping each tool key to its canonical route path.
 */
export const ToolUrls = fromPairs(
  Object.values(ToolKeys).map((toolKey) => {
    const toolGroupKey = findKey(ToolGroupItems, (value) =>
      value.includes(toolKey)
    ) as string;
    return [
      toolKey,
      `/tools/${ToolGroupSlugs[toolGroupKey]}/${ToolSlugs[toolKey]}`,
    ];
  })
);

/**
 * Lucide icon component assigned to each tool.
 */
export const ToolIcons = {
  [ToolKeys.expenseSplitter]: ReceiptText,
  [ToolKeys.markdownNotes]: StickyNote,
  [ToolKeys.signatureStampMaker]: Signature,
  [ToolKeys.qrCodeGenerator]: QrCode,
  [ToolKeys.wifiCardGenerator]: Wifi,
  [ToolKeys.wordCounter]: FileText,
  [ToolKeys.keyCard]: Keyboard,

  [ToolKeys.urlEncoderDecoder]: ArrowLeftRight,
  [ToolKeys.base64EncoderDecoder]: Binary,
  [ToolKeys.jsonFormatter]: CodeXml,
  [ToolKeys.unixTimestampConverter]: Clock,
  [ToolKeys.regexTester]: Regex,
  [ToolKeys.hashGenerator]: Fingerprint,
  [ToolKeys.uuidGenerator]: KeyRound,
  [ToolKeys.colorConverter]: Palette,
  [ToolKeys.jwtDebugger]: ShieldCheck,
  [ToolKeys.zipExtractor]: FolderArchive,
  [ToolKeys.gzipExtractor]: FileArchive,
  [ToolKeys.htmlEntities]: CodeXml,
  [ToolKeys.hexBinaryConverter]: Binary,
  [ToolKeys.cidrCalculator]: Network,

  [ToolKeys.photoEditorStudio]: WandSparkles,
  [ToolKeys.picMergeStudio]: Layers,
  [ToolKeys.base64ToImage]: FileImage,
  [ToolKeys.imageToBase64]: Image,

  [ToolKeys.chromeAiTranslator]: Languages,
  [ToolKeys.chromeAiLanguageDetector]: Radar,
  [ToolKeys.chromeAiSummarizer]: FileText,
  [ToolKeys.chromeAiWriter]: PenTool,
  [ToolKeys.chromeAiRewriter]: RefreshCcw,
  [ToolKeys.chromeAiPrompt]: Bot,
  [ToolKeys.chromeAiProofreader]: SpellCheck,

  [ToolKeys.chromeBarcodeDetector]: QrCode,
  [ToolKeys.chromeFaceDetector]: ScanFace,
  [ToolKeys.chromeTextDetector]: CaseUpper,
};

/**
 * Optional capability/status badges displayed beside category group headings.
 */
export const ToolGroupBadges: Record<string, string> = {
  [ToolGroupKeys.chromeAiApi]: 'On-Device',
};

/**
 * Optional highlight badges displayed beside individual tool entries (e.g. "New", "Popular").
 */
export const ToolBadges: Record<string, string> = {
  [ToolKeys.wifiCardGenerator]: 'New',
  [ToolKeys.signatureStampMaker]: 'New',
  [ToolKeys.photoEditorStudio]: 'New',
  [ToolKeys.qrCodeGenerator]: 'Popular',
  [ToolKeys.picMergeStudio]: 'Popular',
  [ToolKeys.jsonFormatter]: 'Popular',
};

/**
 * Category groups expanded by default in the desktop FeaturePanel sidebar.
 */
const DEFAULT_EXPANDED_TOOL_GROUPS: string[] = [
  ToolGroupKeys.everydayLifeTool,
  ToolGroupKeys.imgTool,
  ToolGroupKeys.devTool,
];

/**
 * Optional static sub-group sections rendered inside large FeaturePanel groups
 * to improve scannability without altering canonical routes or sitemap structure.
 */
const ToolFeaturePanelSubGroups: Record<
  string,
  Array<{ id: string; label: string; items: string[] }>
> = {
  [ToolGroupKeys.devTool]: [
    {
      id: 'format-debug',
      label: 'Format & Debug',
      items: [
        ToolKeys.jsonFormatter,
        ToolKeys.jwtDebugger,
        ToolKeys.regexTester,
      ],
    },
    {
      id: 'encoders',
      label: 'Encoders',
      items: [
        ToolKeys.urlEncoderDecoder,
        ToolKeys.base64EncoderDecoder,
        ToolKeys.htmlEntities,
      ],
    },
    {
      id: 'converters',
      label: 'Converters',
      items: [
        ToolKeys.unixTimestampConverter,
        ToolKeys.colorConverter,
        ToolKeys.hexBinaryConverter,
      ],
    },
    {
      id: 'crypto-ids',
      label: 'Crypto & IDs',
      items: [ToolKeys.hashGenerator, ToolKeys.uuidGenerator],
    },
    {
      id: 'archives-network',
      label: 'Archives & Network',
      items: [
        ToolKeys.zipExtractor,
        ToolKeys.gzipExtractor,
        ToolKeys.cidrCalculator,
      ],
    },
  ],
};

/**
 * Helper that maps a tool key to a FeaturePanel navigation item.
 */
function buildFeaturePanelItem(toolKey: string) {
  return {
    key: toolKey,
    name: ToolTitlesForFeaturePanel[toolKey],
    href: ToolUrls[toolKey],
    icon: {
      component: ToolIcons[toolKey],
    },
    badge: ToolBadges[toolKey],
  };
}

/**
 * Aggregated category groups with full tool metadata for the All Tools overview page.
 */
export const Tools = ToolGroupKeysOrder.map((groupKey) => ({
  id: groupKey,
  name: ToolGroupNames[groupKey],
  badge: ToolGroupBadges[groupKey],
  items: ToolGroupItems[groupKey].map((toolKey) => ({
    key: toolKey,
    name: ToolTitles[toolKey],
    href: ToolUrls[toolKey],
    desc: ToolDescriptions[toolKey],
    badge: ToolBadges[toolKey],
    icon: {
      component: ToolIcons[toolKey],
    },
  })),
}));

/**
 * Pre-built navigation data for the left FeaturePanel sidebar and mobile tools selector.
 */
export const ToolDataForFeaturePanel = ToolGroupKeysOrder.map((groupKey) => ({
  id: groupKey,
  name: ToolGroupNames[groupKey],
  badge: ToolGroupBadges[groupKey],
  defaultExpanded: DEFAULT_EXPANDED_TOOL_GROUPS.includes(groupKey),
  items: ToolGroupItems[groupKey].map(buildFeaturePanelItem),
  subGroups: ToolFeaturePanelSubGroups[groupKey]?.map((subGroup) => ({
    id: subGroup.id,
    label: subGroup.label,
    items: subGroup.items.map(buildFeaturePanelItem),
  })),
}));
