export const mockValidator = async (val: any): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Example: reject if value length < 3
      resolve(val && val.length >= 3);
    }, 500);
  });
};