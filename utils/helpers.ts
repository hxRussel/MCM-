
// Updated to allow higher resolution for OCR
export const compressImage = (file: File, maxWidth = 300, maxHeight = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Use higher quality for OCR
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const formatMoney = (amount: number) => {
  if (amount >= 1000000) {
    return `€${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(1)}K`;
  }
  return `€${amount}`;
};

export const formatNumberInput = (val: string) => {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  return Number(clean).toLocaleString('it-IT');
};

export const cleanNumberInput = (val: string) => {
  return val.replace(/\D/g, '');
};
