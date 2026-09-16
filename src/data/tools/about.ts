import { ToolKeys } from '.';

export interface ToolAboutData {
  overview: string;
  features?: string[];
  bottomNote?: string;
}

export type ToolAboutContent = string | ToolAboutData;

export const ToolAbout: Record<string, ToolAboutContent> = {
  [ToolKeys.qrCodeGenerator]: {
    overview:
      'Quick Response (QR) codes are indispensable for instantly connecting physical media to digital experiences, links, contact details, and plain text. This QR Code Generator enables users to convert any URL or text into an interactive, high-contrast QR code with instant visual feedback.',
    features: [
      'Personalized Color Styling: Customize foreground and background colors with high-contrast color presets or your own custom hex palettes.',
      'Flexible Dimensions & Margins: Freely adjust canvas resolution (128px to 512px) and quiet zone margin width to ensure optimal readability.',
      'Error Correction Levels: Choose between L, M, Q, and H error correction codes (ECC) to maintain scan reliability under various environmental conditions.',
      'Instant PNG & Clipboard Export: One-click PNG image download or direct clipboard copy with keyboard shortcut support (Ctrl+S / Ctrl+C).',
    ],
    bottomNote:
      'QR codes are rendered dynamically on a local canvas element. Your input data remains strictly confidential on your device.',
  },
  [ToolKeys.wordCounter]: {
    overview:
      'Accurately measuring text length and character distribution is essential for writers, editors, translators, and developers. When dealing with multilingual documents, standard word counters frequently miscalculate Chinese characters, English words, or payload byte limits. This tool provides instant, comprehensive character breakdown and text analysis directly in your browser.',
    features: [
      'Bilingual Character Breakdown: Real-time calculation of total characters, Chinese characters, Chinese punctuation, English words, English letters, English punctuation, numbers, and total lines.',
      'UTF-8 Byte Size: Precise byte calculation to assist developers in preparing payload sizes for databases, APIs, and SMS limits.',
      'Social Media Length Checking: Live progress bars and limit counters tailored for X (Twitter), Facebook, Instagram, and LinkedIn posts.',
      'Text Cleanup & Formatting: Built-in case conversions (UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case) and instant whitespace/duplicate line cleaner.',
    ],
    bottomNote:
      'All text operations and metrics calculations run 100% locally in your browser. None of your content is ever uploaded, stored, or sent across any network.',
  },
  [ToolKeys.keyCard]: {
    overview:
      'Having rapid access to frequently referenced code snippets, canned support responses, and everyday notes significantly boosts daily productivity. KeyCard provides a personalized productivity dashboard designed to store, organize, and retrieve reusable information at keystroke speed.',
    features: [
      'Hotkeyed Fast Access: Assign custom keyboard shortcuts to individual cheat cards for instant retrieval and clipboard copying.',
      'Multi-Version Content Cards: Store multiple variants within a single card (e.g. Detailed, Summary, Code, or English version).',
      'Categorization & Search: Organize items with customizable keyword tags and instantly filter via interactive tag pills or search queries.',
      'Flexible Dashboard Views: Switch between full management mode and compact quick-access layout with customizable card sorting.',
    ],
    bottomNote:
      'All cards, tags, and custom shortcuts are persisted in your browser local storage. Your private notes never touch any remote database.',
  },

  // ==================

  [ToolKeys.urlEncoderDecoder]: {
    overview:
      'URL encoding converts unsafe ASCII characters and special symbols into standard percent-encoded format to guarantee reliable HTTP requests and cross-platform web navigation. This tool combines full-string encoding with an interactive query parameter inspector for effortless debugging.',
    features: [
      'Two-Way Encode & Decode: Instantly transform raw text and complex URLs into valid percent-encoded strings or decode encoded payloads.',
      'Visual Query Parameters Table: Automatically parse query parameters into a structured, editable table to add, modify, or delete key-value pairs.',
      'Interactive Parameter Filtering: Quickly search through dozens of query parameters within long URLs and copy individual values in one click.',
      'Real-Time Full URL Sync: Any modification made in the query parameter table immediately reflects back into the synchronized full URL string.',
    ],
    bottomNote:
      'All parsing and encoding operate strictly client-side. Confidential URLs, access tokens, and API credentials are never sent to external servers.',
  },
  [ToolKeys.jsonFormatter]: {
    overview:
      'JSON is the standard format for API exchanges and structured configuration, but unformatted payloads are difficult to read and analyze. This JSON Formatter and Minifier delivers instant formatting, size compression, and structural exploration in a private, high-performance editor.',
    features: [
      'Prettify & Indentation: Format raw or minified JSON with clean 2-space indentation to maximize readability and ease debugging.',
      'Compact Minification: Strip out redundant spaces, line breaks, and whitespace to produce the most compact JSON payload for production.',
      'Interactive Tree View: Explore nested objects and arrays using an interactive collapsible tree structure with expandable node branches.',
      'Syntax Validation & Error Highlighting: Detect malformed JSON syntax immediately with precise error messaging to catch typos quickly.',
    ],
    bottomNote:
      'JSON parsing and AST generation run entirely within your local browser JavaScript engine. Sensitive API payloads remain private.',
  },
  [ToolKeys.unixTimestampConverter]: {
    overview:
      'Unix timestamps (epoch time) represent the elapsed seconds or milliseconds since January 1, 1970 (UTC). They are ubiquitous in server logs, databases, and APIs, but require instant human translation during system troubleshooting and development.',
    features: [
      'Bidirectional Conversion: Seamlessly convert Unix epoch timestamps into formatted date strings and translate human dates into timestamps.',
      'Seconds & Milliseconds: Full precision support for standard 10-digit epoch seconds and high-resolution 13-digit millisecond timestamps.',
      'Real-Time Epoch Clock: Displays a live ticking clock of the current epoch timestamp with one-click copy for rapid debugging.',
      'Timezone Adjustment: Convert timestamps into local time, UTC, and custom timezones, alongside a quick-reference unit conversion table.',
    ],
    bottomNote:
      'All timestamp conversions and timezone offsets are evaluated locally on your device using native browser Date APIs.',
  },
  [ToolKeys.regexTester]: {
    overview:
      'Regular expressions are an essential tool for string matching, validation, and text extraction, but crafting intricate patterns requires visual verification. This Regular Expression Tester provides real-time pattern evaluation with live match highlighting and group inspection.',
    features: [
      'Live Match Highlighting: Instantly visualizes pattern matches and occurrences against sample text as you type.',
      'Capture Group Breakdown: Inspect matched substrings, named/numbered capture groups, and character index positions in detail.',
      'Regex Flag Toggles: Easily switch standard flags including global (g), case-insensitive (i), multiline (m), dotAll (s), and unicode (u).',
      'Built-In Cheat Sheet & Presets: Includes ready-to-use patterns for email addresses, URLs, IP addresses, dates, and common syntax rules.',
    ],
    bottomNote:
      'Patterns and test strings are evaluated locally in your browser JavaScript engine. No input text is recorded or transmitted.',
  },

  // ==================

  [ToolKeys.picMergeStudio]: {
    overview:
      'PicMerge Studio is an intuitive browser-based image editor and collage creation tool designed for arranging multi-picture compositions. Whether assembling social media graphic assets, side-by-side comparisons, or custom photo grids, it provides complete creative control on a clean digital canvas.',
    features: [
      'Social Media Canvas Presets: One-click canvas presets tailored for Instagram (1:1, 4:5), YouTube (16:9), Stories (9:16), and custom pixel dimensions.',
      'Granular Layer & Image Controls: Freely drag, scale, rotate, reorder layers, adjust opacity, and fine-tune image border thickness.',
      'Color & Gradient Backgrounds: Customize canvas backgrounds with solid color fills, linear/radial gradients, or background images.',
      'High-Resolution Image Export: Download finished compositions in crisp PNG or space-saving JPEG with zero loss of quality.',
    ],
    bottomNote:
      'Canvas rendering is powered by Fabric.js running entirely on your local GPU/CPU. Uploaded images never leave your computer.',
  },
  [ToolKeys.base64ToImage]: {
    overview:
      'Base64 image strings allow binary image data to be serialized and embedded directly inside HTML, CSS, JSON, or API payloads. This Base64 to Image decoder converts raw encoded strings back into viewable graphic files with zero setup.',
    features: [
      'Instant Graphic Rendering: Paste standard Base64 strings or full Data URIs to preview the decoded graphic immediately.',
      'Automatic Prefix Detection: Automatically prepends standard data URI prefixes if they are omitted in the input string.',
      'Image Resolution & File Size Inspection: Inspect image width, height, aspect ratio, and decoded file size in kilobytes.',
      'Direct Download & Clipboard Copy: Save decoded pictures directly to disk or copy image data to your clipboard with one click.',
    ],
    bottomNote:
      'Decoding occurs entirely in-memory within your browser. Encoded image data is never uploaded to any cloud server.',
  },
  [ToolKeys.imageToBase64]: {
    overview:
      'Converting raster images into Base64 Data URIs is widely practiced to eliminate extra HTTP requests, bundle assets into single-file documents, and embed icons into frontend CSS or HTML. This tool performs high-speed client-side image encoding.',
    features: [
      'Drag-and-Drop Encoding: Drop any PNG, JPEG, WebP, GIF, or SVG image to convert it into a Base64 string instantly.',
      'Dimensions & Size Metrics: View original pixel dimensions, file size, and total character length of the resulting Base64 output.',
      'One-Click String Copy: Quickly copy the complete Data URI string to your clipboard for direct use in codebases or stylesheets.',
      'Zero Cloud Upload: Image processing takes place entirely in browser memory using the native FileReader API.',
    ],
    bottomNote:
      'Image files are read and processed directly on your local device. Your files are never uploaded or stored anywhere.',
  },

  // ==================

  [ToolKeys.chromeAiTranslator]: {
    overview:
      'Modern browsers now provide native artificial intelligence capabilities without requiring external cloud services. This Translator utilizes Chrome’s built-in AI (Gemini Nano) to translate text across languages instantly and privately on your machine.',
    features: [
      'On-Device AI Translation: Translates content locally using Chrome built-in models with zero network round trips or latency.',
      'No API Key or Server Quota: Run unlimited translation queries without registering for API tokens, payment credentials, or quotas.',
      'Multilingual Text Support: Supports bidirectional translation across major global languages supported by your local Chrome runtime.',
      'Full Data Privacy: Confidential correspondence, business documents, and private snippets never exit your local device.',
    ],
    bottomNote:
      'Powered by Chrome’s experimental Translation API. All neural processing runs locally on your device hardware.',
  },
  [ToolKeys.chromeAiLanguageDetector]: {
    overview:
      'Accurate language identification is a prerequisite for multilingual text routing, automatic translation, and accessibility. This Language Detector harnesses Chrome’s on-device AI to detect language distribution in any text snippet.',
    features: [
      'Instant Language Identification: Analyzes input text to identify primary language codes and descriptive names in real time.',
      'Confidence Score Metrics: Delivers confidence percentages indicating the model’s certainty for each language candidate.',
      'Zero Latency Execution: Bypasses cloud network hops by evaluating text directly against locally cached on-device AI models.',
      'Private Text Processing: Sensitive documents and personal notes can be audited without third-party data collection.',
    ],
    bottomNote:
      'Utilizes Chrome’s experimental Language Detection API executing entirely on-device.',
  },
  [ToolKeys.chromeAiSummarizer]: {
    overview:
      'Consuming extensive articles, meeting transcripts, and research documents can be time-consuming. This Summarizer tool leverages Chrome’s built-in Gemini Nano model to condense long passages into crisp, coherent summaries in seconds.',
    features: [
      'Key Point Extraction: Distills lengthy articles and notes down to core arguments, main takeaways, and critical findings.',
      'Configurable Format & Length: Choose summary types such as bullet points, concise paragraphs, or executive TL;DR abstracts.',
      'On-Device AI Inference: Operates completely offline once model weights are initialized by Chrome, ensuring blazing speed.',
      'Complete Privacy Protection: Sensitive internal memos and research papers are processed locally without cloud leakage.',
    ],
    bottomNote:
      'Powered by Chrome’s built-in Summarization API. No text is transmitted or logged outside your browser.',
  },
  [ToolKeys.chromeAiWriter]: {
    overview:
      'Drafting structured emails, documentation, and creative content is accelerated by artificial intelligence. This Writer tool interfaces with Chrome’s embedded Gemini Nano model to produce natural, articulate copy tailored to your creative prompts.',
    features: [
      'Prompt-Guided Drafting: Create outlines, email responses, professional announcements, and articles from brief seed prompts.',
      'Customizable Writing Persona: Adapt generated output to suit formal, casual, technical, or marketing communication styles.',
      'Private Generative Writing: Draft confidential business correspondence and personal writing without sending data to cloud AI providers.',
      'Zero Token Costs: Experiment freely with generative writing without incurring third-party API usage fees.',
    ],
    bottomNote:
      'Runs locally via Chrome’s experimental Writer API. Content is generated directly on your machine.',
  },
  [ToolKeys.chromeAiRewriter]: {
    overview:
      'Polishing text for clarity, conciseness, and audience tone is essential for effective communication. This Rewriter tool utilizes Chrome’s on-device AI to restructure sentences and elevate vocabulary while preserving the original meaning.',
    features: [
      'Clarity & Readability Tuning: Smooth out awkward phrasing, eliminate redundancy, and improve paragraph flow.',
      'Tone Adjustment: Effortlessly shift draft content between formal, casual, professional, or persuasive registers.',
      'Length Modification: Expand concise bullet points into full prose or condense verbose paragraphs into succinct summaries.',
      'Local On-Device Privacy: Confidential business drafts and personal manuscripts remain strictly confined to your device.',
    ],
    bottomNote:
      'Powered by Chrome’s experimental Rewriter API with local neural inference.',
  },
  [ToolKeys.chromeAiPrompt]: {
    overview:
      'Chrome’s Prompt API offers direct low-level access to the browser’s built-in Gemini Nano model. This Prompt tool serves as an interactive playground for developers and enthusiasts to test system prompts, parameters, and AI capabilities.',
    features: [
      'Direct LLM Interaction: Send open-ended system and user prompts directly to Chrome’s local language model.',
      'Parameter Experimentation: Fine-tune model sampling behavior with adjustable temperature and top-k controls.',
      'Streaming Token Generation: Observe real-time token streaming as the model synthesizes its reasoning and responses.',
      'Developer API Playground: Prototype and evaluate browser-native AI workflows before deploying web applications.',
    ],
    bottomNote:
      'Executes directly against Chrome’s local Foundation Model (Gemini Nano) with zero cloud dependencies.',
  },
  [ToolKeys.chromeAiProofreader]: {
    overview:
      'Flawless grammar, spelling, and punctuation are fundamental to credible professional writing. This AI Proofreader inspects your text in real time using Chrome’s on-device AI to flag grammatical missteps and propose stylistic enhancements.',
    features: [
      'Grammar & Spelling Correction: Automatically identifies syntactic flaws, spelling errors, and missing punctuation.',
      'Style & Flow Refinement: Recommends vocabulary and structural adjustments to produce more engaging, polished prose.',
      'Real-Time In-Browser Inspection: Fast local feedback without waiting for external API round-trip network requests.',
      'Private Writing Audit: Proofread confidential legal documents, resumes, and personal messages with absolute peace of mind.',
    ],
    bottomNote:
      'Processed locally through Chrome’s built-in AI models. Your text is never stored or transmitted over the network.',
  },

  // ==================

  [ToolKeys.chromeFaceDetector]: {
    overview:
      'Face detection is a foundational capability for smart camera tools, photo tagging, and image analysis. This tool demonstrates the browser’s native Shape Detection API, identifying human face positions within uploaded images.',
    features: [
      'Hardware-Accelerated Detection: Uses the browser’s native Web Detection API for rapid, hardware-accelerated face localization.',
      'Visual Bounding Box Overlay: Renders pinpoint bounding boxes around detected faces directly on top of the image preview.',
      'Coordinate & Geometry Inspection: View numerical coordinate positions (x, y, width, height) and face count statistics.',
      'Secure Local Image Processing: Photos are analyzed directly inside your browser memory without cloud uploading.',
    ],
    bottomNote:
      'Face detection runs entirely on your local device via the Web Shape Detection API.',
  },
  [ToolKeys.chromeBarcodeDetector]: {
    overview:
      'Scanning barcodes and QR codes from image files is essential for logistics, retail auditing, and document management. This Barcode Detector harnesses the native Web Detection API to scan and decode barcodes in the browser.',
    features: [
      'Multi-Format Barcode Scanning: Supports 1D and 2D barcode formats including QR Code, Code 128, EAN-13, UPC, and Data Matrix.',
      'Bounding Box Visualization: Visually highlights the exact spatial location and orientation of detected codes on the image.',
      'Raw Payload Decoding: Instantly extracts and formats encoded string payloads with one-click clipboard copying.',
      'Client-Side Image Analysis: Inspect images containing sensitive tracking barcodes without sending them to third parties.',
    ],
    bottomNote:
      'Powered by the native Barcode Detection API. All scanning occurs locally in your browser.',
  },
  [ToolKeys.chromeTextDetector]: {
    overview:
      'Extracting readable text from screenshots, documents, and camera photos (OCR) enables automated data entry and searching. This Text Detector utilizes the browser’s native Shape Detection API to detect and extract textual blocks.',
    features: [
      'Native In-Browser OCR: Detects and transcribes textual characters from raster images without heavy third-party OCR libraries.',
      'Visual Text Box Highlighting: Outlines detected words and text blocks directly on the image preview canvas.',
      'One-Click Text Extraction: Easily extract, inspect, and copy recognized text strings to your clipboard.',
      'Zero Cloud Transmission: Ideal for extracting text from receipts, identity cards, and confidential documents safely.',
    ],
    bottomNote:
      'All optical character recognition is performed locally on your device via the Web Shape Detection API.',
  },
};
