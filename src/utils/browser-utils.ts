const browserUtils = {
  sleep: (timestamp: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timestamp);
    });
  },
};

export default browserUtils;
