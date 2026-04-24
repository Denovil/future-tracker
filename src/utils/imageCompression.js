const DEFAULT_MAX_DIMENSION = 1700;
const JPEG_QUALITY = 0.86;
const WEBP_QUALITY = 0.84;
const MIN_SIZE_GAIN_RATIO = 0.02;
const MIN_BYTES_TO_COMPRESS = 180 * 1024;
const MAX_PARALLEL_COMPRESSIONS = 4;
const MIN_QUALITY = 0.56;
const QUALITY_STEP = 0.06;
const MAX_QUALITY_ATTEMPTS = 6;

const SIZE_KB = 1024;
const SIZE_MB = SIZE_KB * 1024;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const canUseCanvasCompression = () =>
  typeof window !== "undefined" &&
  typeof document !== "undefined" &&
  typeof document.createElement === "function";

const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to decode image file."));
    };

    image.src = objectUrl;
  });

const loadImageSource = async (file) => {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => {
          if (typeof bitmap.close === "function") bitmap.close();
        },
      };
    } catch {
      // Fallback to Image element decoder below.
    }
  }

  const image = await loadImageElement(file);
  return {
    source: image,
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    release: () => {},
  };
};

const toBlobAsync = (canvas, type, quality) =>
  new Promise((resolve) => {
    canvas.toBlob((value) => resolve(value), type, quality);
  });

const resolveAdaptivePlan = (fileSize) => {
  if (fileSize >= 10 * SIZE_MB) {
    return { targetBytes: 900 * SIZE_KB, softLimitBytes: 1200 * SIZE_KB, maxDimension: 1300 };
  }
  if (fileSize >= 6 * SIZE_MB) {
    return { targetBytes: 760 * SIZE_KB, softLimitBytes: 1000 * SIZE_KB, maxDimension: 1450 };
  }
  if (fileSize >= 3 * SIZE_MB) {
    return { targetBytes: 620 * SIZE_KB, softLimitBytes: 860 * SIZE_KB, maxDimension: 1550 };
  }
  if (fileSize >= 1 * SIZE_MB) {
    return { targetBytes: 470 * SIZE_KB, softLimitBytes: 700 * SIZE_KB, maxDimension: 1650 };
  }
  return { targetBytes: 340 * SIZE_KB, softLimitBytes: 540 * SIZE_KB, maxDimension: DEFAULT_MAX_DIMENSION };
};

const resolveOutputType = (mime) => {
  if (mime === "image/jpeg" || mime === "image/jpg") return "image/jpeg";
  if (mime === "image/webp" || mime === "image/png") return "image/webp";
  return "image/jpeg";
};

const resolveExtension = (outputType) => {
  if (outputType === "image/jpeg") return ".jpg";
  if (outputType === "image/png") return ".png";
  if (outputType === "image/webp") return ".webp";
  return "";
};

const compressOneImage = async (file) => {
  const mime = String(file?.type || "").toLowerCase();
  if (!file || !mime.startsWith("image/")) return file;
  if (mime === "image/gif") return file;
  if (file.size < MIN_BYTES_TO_COMPRESS) return file;
  if (!canUseCanvasCompression()) return file;

  const imageSource = await loadImageSource(file);
  try {
    const width = imageSource.width;
    const height = imageSource.height;
    if (!width || !height) return file;

    const plan = resolveAdaptivePlan(file.size);
    const outputType = resolveOutputType(mime);
    const maxDimension = plan.maxDimension;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return file;
    ctx.drawImage(imageSource.source, 0, 0, targetWidth, targetHeight);

    const startingQuality = outputType === "image/webp" ? WEBP_QUALITY : JPEG_QUALITY;
    let quality = startingQuality;
    let bestBlob = null;

    for (let attempt = 0; attempt < MAX_QUALITY_ATTEMPTS; attempt += 1) {
      const blob = await toBlobAsync(canvas, outputType, quality);
      if (!blob) break;

      bestBlob = blob;
      if (blob.size <= plan.targetBytes) break;

      quality = clamp(quality - QUALITY_STEP, MIN_QUALITY, startingQuality);
      if (quality <= MIN_QUALITY) break;
    }

    let blob = bestBlob;
    if (blob && blob.size > plan.softLimitBytes) {
      const secondScale = 0.88;
      const secondWidth = Math.max(1, Math.round(targetWidth * secondScale));
      const secondHeight = Math.max(1, Math.round(targetHeight * secondScale));

      if (secondWidth < targetWidth && secondHeight < targetHeight) {
        canvas.width = secondWidth;
        canvas.height = secondHeight;
        ctx.drawImage(imageSource.source, 0, 0, secondWidth, secondHeight);
        const secondBlob = await toBlobAsync(canvas, outputType, quality);
        if (secondBlob) {
          blob = secondBlob;
        }
      }
    }

    if (!blob) return file;

    const reducedEnough = blob.size < file.size * (1 - MIN_SIZE_GAIN_RATIO);
    const resizedDown = scale < 1;
    if (!reducedEnough && !resizedDown) {
      return file;
    }

    const extension = resolveExtension(outputType);
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const nextName = extension ? `${baseName}${extension}` : file.name;

    return new File([blob], nextName, {
      type: outputType,
      lastModified: Date.now(),
    });
  } finally {
    imageSource.release();
  }
};

export const compressImagesForUpload = async (files = []) => {
  const list = Array.from(files || []);
  const output = new Array(list.length);
  let index = 0;

  const workers = Array.from(
    { length: Math.min(MAX_PARALLEL_COMPRESSIONS, list.length) },
    async () => {
      while (index < list.length) {
        const current = index;
        index += 1;
        const file = list[current];
        try {
          output[current] = await compressOneImage(file);
        } catch {
          output[current] = file;
        }
      }
    }
  );

  await Promise.all(workers);

  return output;
};
