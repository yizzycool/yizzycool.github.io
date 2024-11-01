const imageUtils = {
  newImageFromBase64: (base64: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(img);
      img.src = base64;
    });
  },
  newImageFromBlob: (blob: Blob): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(img);
      img.src = window.URL.createObjectURL(blob);
    });
  }
}

export default imageUtils;