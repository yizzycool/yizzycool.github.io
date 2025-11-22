import _size from 'lodash/size';
import _range from 'lodash/range';
import _round from 'lodash/round';

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
  },
  blobToBase64: (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },
  imageToBlob: (
    img: HTMLImageElement,
    type: string = 'image/png'
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => resolve(blob), type);
    });
  },
  parseTypeFromBase64: (base64: string): string => {
    const matches = base64.match(/^data:(image\/[a-z]+);/);
    if (matches && _size(matches) >= 2) {
      return matches[1];
    } else {
      return '';
    }
  },
  toHumanReadableSize: (size: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const step = 1000;
    for (const idx of _range(units.length)) {
      if (size < step) {
        return `${_round(size, 1)} ${units[idx]}`;
      } else {
        size /= step;
      }
    }
    return `${_round(size, 1)} ${units[units.length - 1]}`;
  },
};

export default imageUtils;
