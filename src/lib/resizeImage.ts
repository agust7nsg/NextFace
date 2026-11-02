// src/lib/resizeImage.ts

// Read the file as a Data URL via FileReader first — this is the reliable path
// in Capacitor/Android WebView, where blob URLs from URL.createObjectURL can
// fail to load in <img> due to CORS/tainted-canvas restrictions.
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || result.length < 100) {
        reject(new Error("Could not read this photo. Please try a different photo."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Could not read this photo. Please try a different photo."));
    reader.readAsDataURL(file);
  });
}

// Load an Image from a data URL and wait for onload.
function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        reject(new Error("This photo could not be loaded. Please try a different photo."));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error("This photo could not be loaded. Please try a different photo."));
    img.src = dataUrl;
  });
}

// Sample pixels across the canvas to detect a blank/uniform frame.
// This catches the Android WebView failure mode where an <img> fires
// onload for a HEIC/HEIF file (with real naturalWidth/naturalHeight)
// but never actually decoded any pixel data, so drawImage() paints
// nothing and the canvas is left as a flat, uniform color.
function isCanvasBlank(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  if (width === 0 || height === 0) return true;

  const sampleCols = 12;
  const sampleRows = 12;
  let firstR = -1, firstG = -1, firstB = -1;
  let uniform = true;

  for (let row = 0; row < sampleRows && uniform; row++) {
    for (let col = 0; col < sampleCols; col++) {
      const x = Math.min(width - 1, Math.floor((col + 0.5) * (width / sampleCols)));
      const y = Math.min(height - 1, Math.floor((row + 0.5) * (height / sampleRows)));
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const [r, g, b] = pixel;

      if (firstR === -1) {
        firstR = r;
        firstG = g;
        firstB = b;
        continue;
      }

      // Allow a little tolerance for JPEG-like noise / anti-aliasing,
      // but a real photo will have far more variance than this across
      // a 12x12 grid spanning the whole image.
      const diff = Math.abs(r - firstR) + Math.abs(g - firstG) + Math.abs(b - firstB);
      if (diff > 12) {
        uniform = false;
      }
    }
  }

  return uniform;
}

// Convert an image element to a JPEG data URL via canvas, waiting for full load.
// Throws if the canvas ends up blank (undecoded source image).
function imageToJpegDataUrl(img: HTMLImageElement, maxSide: number, quality: number): string {
  let { naturalWidth: width, naturalHeight: height } = img;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("This device cannot process images. Please try a different photo.");

  // Fill white background so transparent PNGs don't become black on JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);

  if (isCanvasBlank(ctx, targetW, targetH)) {
    throw new Error("Canvas produced a blank frame (source image did not decode)");
  }

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return dataUrl;
}

export async function resizeToMax1080(file: File): Promise<{ dataUrl: string; w: number; h: number }> {
  // Step 1: Read the file as a Data URL via FileReader — reliable in Capacitor WebView.
  const rawDataUrl = await fileToDataUrl(file);

  // Step 2: Load the Image from the Data URL, waiting for onload.
  const img = await loadImageFromDataUrl(rawDataUrl);

  // Step 3: Draw to canvas and export as JPEG.
  try {
    const dataUrl = imageToJpegDataUrl(img, 1080, 0.92);
    const base64Payload = dataUrl.split("base64,")[1] ?? "";

    if (base64Payload.length < 5000) {
      throw new Error("Canvas produced invalid output");
    }

    return { dataUrl, w: img.naturalWidth, h: img.naturalHeight };
  } catch {
    // Canvas conversion failed (HEIC on Android WebView, blank/tainted canvas, etc.)
    // Only forward the raw bytes if they're already JPEG — HEIC raw bytes are
    // useless to the backend, so we surface a clear, actionable error instead.
    const rawBase64 = rawDataUrl.split("base64,")[1] ?? "";
    if (rawBase64.startsWith("/9j/")) {
      return { dataUrl: `data:image/jpeg;base64,${rawBase64}`, w: 0, h: 0 };
    }
    throw new Error(
      "This photo could not be processed on your device. This usually happens with HEIC photos from the camera roll — please try taking a new photo or picking a JPEG/PNG file instead."
    );
  }
}