type FaceLandmark = {
  locations: Array<{ x: number; y: number }>;
  type: string;
};

export type FaceDetectionResults = Array<{
  boundingBox: {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
    x: number;
    y: number;
  };
  landmarks: Array<FaceLandmark>;
}>;

export type FaceDetectorInstance = {
  detect: (image: HTMLImageElement) => Promise<FaceDetectionResults>;
};

export type WindowDetector = {
  FaceDetector: new () => FaceDetectorInstance;
};
