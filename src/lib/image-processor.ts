/**
 * Client-Side Image Pre-Processing Module
 *
 * Performs pre-upload optimizations:
 * - Resizes image to max 1024px on the long side
 * - Corrects EXIF orientation
 * - Converts image to JPEG format (handling HEIC/PNG/WebP gracefully)
 * - Compresses to ~0.8 quality
 * - Returns clean base64 payload WITHOUT data: prefix, along with mimeType and previewUrl
 */

export interface ProcessedImage {
  base64: string; // Clean base64 string WITHOUT data: prefix
  mimeType: string; // e.g. "image/jpeg"
  previewUrl: string; // Full data URL for <img> preview
  width: number;
  height: number;
}

export async function processImageForUpload(source: File | Blob | string): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const processCanvas = (
      sourceElement: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
      origWidth: number,
      origHeight: number
    ) => {
      const maxLongSide = 1024;
      let targetWidth = origWidth;
      let targetHeight = origHeight;

      if (origWidth > maxLongSide || origHeight > maxLongSide) {
        if (origWidth >= origHeight) {
          targetWidth = maxLongSide;
          targetHeight = Math.round((origHeight * maxLongSide) / origWidth);
        } else {
          targetHeight = maxLongSide;
          targetWidth = Math.round((origWidth * maxLongSide) / origHeight);
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to create 2D canvas context for image processing."));
        return;
      }

      // Draw and scale onto canvas
      ctx.drawImage(sourceElement, 0, 0, targetWidth, targetHeight);

      // Export as JPEG with 0.8 compression quality
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

      if (!dataUrl || !dataUrl.includes(",")) {
        reject(new Error("Failed to generate JPEG base64 data from canvas."));
        return;
      }

      const parts = dataUrl.split(",");
      const header = parts[0] || "";
      const base64 = parts[1] || "";

      const mimeMatch = header.match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] || "image/jpeg" : "image/jpeg";

      resolve({
        base64,
        mimeType,
        previewUrl: dataUrl,
        width: targetWidth,
        height: targetHeight,
      });
    };

    // If source is a data URL string
    if (typeof source === "string") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => processCanvas(img, img.width, img.height);
      img.onerror = () => reject(new Error("Failed to load image from data URL."));
      img.src = source;
      return;
    }

    // If createImageBitmap is supported, use it for automatic EXIF orientation
    if (typeof window !== "undefined" && "createImageBitmap" in window) {
      createImageBitmap(source, { imageOrientation: "from-image" })
        .then((bitmap) => {
          processCanvas(bitmap, bitmap.width, bitmap.height);
        })
        .catch(() => {
          // Fallback to FileReader + HTMLImageElement if createImageBitmap fails
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => processCanvas(img, img.width, img.height);
            img.onerror = () =>
              reject(
                new Error(
                  "Could not decode image format. If uploading HEIC from iPhone, please select a JPEG or PNG photo."
                )
              );
            img.src = (e.target?.result as string) || "";
          };
          reader.onerror = () => reject(new Error("Failed to read image file."));
          reader.readAsDataURL(source);
        });
      return;
    }

    // Fallback for older environments
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => processCanvas(img, img.width, img.height);
      img.onerror = () => reject(new Error("Failed to decode image file."));
      img.src = (e.target?.result as string) || "";
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(source);
  });
}
