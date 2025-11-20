const browserUtils = {
  sleep: (timestamp: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timestamp);
    });
  },
  encodeURI: (uri: string) => {
    try {
      return encodeURIComponent(uri);
    } catch {
      return uri;
    }
  },
  decodeURI: (uri: string) => {
    try {
      return decodeURIComponent(uri);
    } catch {
      return uri;
    }
  },
};

export default browserUtils;
