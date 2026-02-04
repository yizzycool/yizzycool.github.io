import { ToolKeys } from '.';

export const ToolAbout = {
  [ToolKeys.qrCodeGenerator]:
    'QR codes are commonly used to share URLs, text, and other information across devices. This QR Code Generator allows users to quickly generate QR codes from custom input such as text or URLs. The tool provides instant previews and client-side generation, making it easy to create QR codes for sharing links, contact information, or messages.',

  [ToolKeys.wordCounter]:
    'Accurately measuring text length is important for writing, publishing, and social media. This Word Counter supports both Chinese and English text, providing word, character, number, and line counts. It also includes social media character limit guidance and basic text transformations such as uppercase, lowercase, title case, and trimming whitespace to help users prepare content efficiently.',

  // ==================

  [ToolKeys.urlEncoderDecoder]:
    'URL encoding is commonly used to safely transmit data through URLs by converting special characters into a percent-encoded format. This URL Encoder & Decoder allows users to quickly encode URLs for web requests or decode encoded URLs back into a readable format. It is useful for developers working with query strings, APIs, and web forms, as well as anyone who needs to ensure URLs are properly formatted and compatible across different systems.',
  [ToolKeys.jsonFormatter]:
    'JSON is a widely used data format, but raw JSON can be difficult to read or unnecessarily large. This JSON Formatter & Minifier helps users format JSON with proper indentation for better readability, or minify JSON by removing whitespace to reduce file size. The tool also validates JSON structure during processing, making it useful for debugging API responses, configuration files, and data exchange workflows.',
  [ToolKeys.unixTimestampConverter]:
    'Unix timestamps, also known as epoch time, represent the number of seconds or milliseconds since January 1, 1970 (UTC). This Unix Timestamp Converter allows users to convert Unix timestamps into human-readable date and time formats, or generate Unix timestamps from a given date and time. It supports both seconds and milliseconds, making it useful for debugging logs, APIs, and time-related data.',
  [ToolKeys.regexTester]:
    'Regular expressions are powerful but can be difficult to debug without proper tools. This Regular Expression Tester allows users to test and validate regex patterns in real time, with instant match highlighting and capture group inspection. It helps developers quickly understand how a pattern behaves against sample text, identify syntax errors, and refine expressions for searching, validation, or text processing tasks.',

  // ==================

  [ToolKeys.picMergeStudio]:
    'PicMerge Studio is a lightweight online poster editor designed for combining multiple images into a single, well-structured canvas. It provides an intuitive editing experience that allows users to freely drag, resize, rotate, and arrange images with precision. Whether you are creating a poster, a visual layout, or a simple image composition, PicMerge Studio focuses on clarity, control, and efficiency. The editor supports flexible canvas sizing, free and grid-based layouts, and high-resolution exports without requiring any installation. Built for speed and simplicity, PicMerge Studio helps users turn multiple images into a clean, customizable poster in just a few steps.',
  [ToolKeys.base64ToImage]:
    'Base64 encoding is often used to embed images directly into text-based formats such as HTML, CSS, or JSON. This Base64 to Image tool allows users to decode Base64-encoded image strings and preview the resulting image instantly. It is useful for developers debugging embedded images, inspecting API responses, or converting Base64 data back into standard image formats without uploading files to a server.',
  [ToolKeys.imageToBase64]:
    'Converting images to Base64 is commonly used for embedding images in web applications and data payloads. This Image to Base64 tool allows users to convert image files into Base64-encoded strings instantly. It supports common image formats and processes everything client-side, making it a convenient way to prepare images for APIs, HTML embedding, or testing purposes.',

  // ==================

  [ToolKeys.chromeAiTranslator]:
    'This Translator tool uses Chrome’s built-in AI capabilities to provide fast and accurate text translation across multiple languages. It allows users to translate content instantly without external APIs or API keys. The tool is suitable for developers testing browser-based AI features, as well as users who need quick translations for text snippets, documents, or multilingual content workflows.',
  [ToolKeys.chromeAiLanguageDetector]:
    'Detecting the language of text is a common requirement in multilingual applications. This Language Detector uses Chrome’s built-in AI to identify the language of input text quickly and accurately. It helps developers and users analyze content, route text to appropriate translation workflows, and better understand language distribution without relying on third-party services.',
  [ToolKeys.chromeAiSummarizer]:
    'Long text can be difficult to review or share efficiently. This Summarizer tool uses Chrome’s built-in AI to generate concise summaries from longer content. It helps users quickly understand key points, reduce reading time, and extract essential information from articles, documents, or notes. The tool is processed client-side, making it fast and suitable for everyday content analysis.',
  [ToolKeys.chromeAiWriter]:
    'The Writer tool uses Chrome’s built-in AI to generate text based on user input and prompts. It can assist with drafting content, brainstorming ideas, or producing structured text for various writing scenarios. This tool is useful for developers experimenting with browser-based AI writing capabilities, as well as users who need quick text generation without external services.',
  [ToolKeys.chromeAiRewriter]:
    'Rewriting text is useful when improving clarity, adjusting tone, or refining existing content. This Rewriter tool uses Chrome’s built-in AI to rewrite text while preserving the original meaning. It helps users improve readability, simplify complex sentences, or adapt content for different audiences without manually rewriting everything from scratch.',
  [ToolKeys.chromeAiPrompt]:
    'Effective prompts are essential for getting better results from AI systems. This Prompt Tool helps users generate and refine structured prompts using Chrome’s built-in AI. It is designed to improve clarity, intent, and completeness of prompts, making it easier to interact with AI writing and generation tools across different use cases.',
  [ToolKeys.chromeAiProofreader]:
    'Proofreading is essential for clear and professional writing. This AI Proofreader tool uses Chrome’s built-in AI to instantly check and correct grammar, spelling, punctuation, and writing style. It helps users improve clarity, readability, and overall text quality without relying on external services. The tool processes text entirely on-device, making it fast, private, and suitable for writers, developers, and anyone looking to refine their content efficiently.',

  // ==================

  [ToolKeys.chromeFaceDetector]:
    'Face detection is commonly used in image analysis and computer vision applications. This Face Detector tool uses the Web Detection API to detect human faces within images and identify their positions. It helps developers test browser-based face detection capabilities and understand how face detection works directly in the web environment.',
  [ToolKeys.chromeBarcodeDetector]:
    'Barcodes are widely used for product identification and data encoding. This Barcode Detector tool uses the Web Detection API to detect and read barcodes from images. It supports common barcode formats and processes images client-side, making it useful for testing barcode detection features in modern web browsers.',
  [ToolKeys.chromeTextDetector]:
    'Text detection allows applications to extract readable text from images. This Text Detector tool uses the Web Detection API to detect and extract text from image content. It is useful for developers exploring browser-based OCR capabilities and for users who want to quickly analyze or inspect text embedded within images.',
};
