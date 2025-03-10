interface FaceDetectorInstance {
  detect: (
    image: HTMLImageElement | HTMLCanvasElement
  ) => Promise<FaceDetectionResults>;
}

type FaceDetectionResults = Array<{
  boundingBox: DetectedBoundingBox;
  landmarks: Array<FaceLandmark>;
}>;

type FaceLandmark = {
  locations: Array<{ x: number; y: number }>;
  type: string;
};
