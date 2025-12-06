export const UnsupportedApiTypes = {
  webApiFaceDetector: 'webApiFaceDetector',
  webApiBarcodeDetector: 'webApiBarcodeDetector',
  webApiTextDetector: 'webApiTextDetector',
};

export const WebDetectApiNames = {
  [UnsupportedApiTypes.webApiFaceDetector]: 'Face Detector',
  [UnsupportedApiTypes.webApiBarcodeDetector]: 'Barcode Detector',
  [UnsupportedApiTypes.webApiTextDetector]: 'Text Detector',
};

export type UnsupportedApiType =
  (typeof UnsupportedApiTypes)[keyof typeof UnsupportedApiTypes];
