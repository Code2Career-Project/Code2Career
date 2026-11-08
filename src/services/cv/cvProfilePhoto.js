const MAX_EDGE = 320;
const JPEG_QUALITY = 0.82;
const MAX_DATA_URL_LENGTH = 220000;

export function resolveProfilePhotoSrc(personal) {
  if (!personal || typeof personal !== 'object') return '';
  if (typeof personal.profilePhotoData === 'string' && personal.profilePhotoData.startsWith('data:image/')) {
    return personal.profilePhotoData;
  }
  if (typeof personal.profilePhotoUrl === 'string' && personal.profilePhotoUrl.trim()) {
    return personal.profilePhotoUrl.trim();
  }
  return '';
}

export function normalizeProfilePhotoData(value) {
  if (typeof value !== 'string' || !value.startsWith('data:image/')) return '';
  if (value.length > MAX_DATA_URL_LENGTH) return '';
  return value;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image could not be loaded'));
    };
    img.src = url;
  });
}

export async function compressImageFileToDataUrl(file) {
  if (!file || !String(file.type || '').startsWith('image/')) {
    throw new Error('Please choose a valid image file');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image is too large. Choose a file under 8 MB.');
  }
  const img = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process image');
  ctx.drawImage(img, 0, 0, width, height);
  let dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    dataUrl = canvas.toDataURL('image/jpeg', 0.65);
  }
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    throw new Error('Image is still too large after compression. Try a smaller photo.');
  }
  return dataUrl;
}
