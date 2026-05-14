export const UNSUPPORTED_API_TYPES = {
  webApiFaceDetector: 'webApiFaceDetector',
  webApiBarcodeDetector: 'webApiBarcodeDetector',
  webApiTextDetector: 'webApiTextDetector',
};

export const WEB_DETECT_API_NAMES = {
  [UNSUPPORTED_API_TYPES.webApiFaceDetector]: 'Face Detector',
  [UNSUPPORTED_API_TYPES.webApiBarcodeDetector]: 'Barcode Detector',
  [UNSUPPORTED_API_TYPES.webApiTextDetector]: 'Text Detector',
};

export type UnsupportedApiType =
  (typeof UNSUPPORTED_API_TYPES)[keyof typeof UNSUPPORTED_API_TYPES];
