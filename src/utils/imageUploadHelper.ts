import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase/config';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  squareCrop?: boolean;
}

/**
 * Resizes and optimizes an image file client-side using HTML5 Canvas.
 * Produces an optimized JPEG data URL (typically 30KB - 80KB) that is
 * fast to render, saves reliably in Firestore & localStorage, and has zero CORS issues.
 */
export async function processAndCompressImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<{ dataUrl: string; blob: Blob }> {
  const { maxWidth = 500, maxHeight = 500, quality = 0.85, squareCrop = true } = options;

  return new Promise((resolve, reject) => {
    // Basic file validation
    if (!file.type.startsWith('image/')) {
      return reject(new Error('দয়া করে একটি সঠিক ইমেজ ফাইল (JPG, PNG, WEBP ইত্যাদি) নির্বাচন করুন।'));
    }

    // Limit input file size to 15MB before client-side downsampling
    if (file.size > 15 * 1024 * 1024) {
      return reject(new Error('ইমেজের সাইজ সর্বোচ্চ ১৫ মেগাবাইট হতে পারবে।'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবি পড়তে সমস্যা হয়েছে।'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ছবি লোড করতে ব্যর্থ হয়েছে।'));
      img.onload = () => {
        let { width, height } = img;

        let srcX = 0;
        let srcY = 0;
        let srcWidth = width;
        let srcHeight = height;

        let targetWidth = width;
        let targetHeight = height;

        if (squareCrop) {
          // Center-crop to square
          const minDim = Math.min(width, height);
          srcX = (width - minDim) / 2;
          srcY = (height - minDim) / 2;
          srcWidth = minDim;
          srcHeight = minDim;

          const finalDim = Math.min(minDim, Math.min(maxWidth, maxHeight));
          targetWidth = finalDim;
          targetHeight = finalDim;
        } else {
          // Maintain aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            targetWidth = Math.round(width * ratio);
            targetHeight = Math.round(height * ratio);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('ক্যানভাস ইনিশিয়ালাইজ করা যায়নি।'));
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image
        ctx.drawImage(
          img,
          srcX,
          srcY,
          srcWidth,
          srcHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ dataUrl, blob });
            } else {
              resolve({ dataUrl, blob: new Blob() });
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an avatar image.
 * Tries Firebase Storage first, and if not accessible (or offline), falls back to the compressed data URL.
 */
export async function uploadAvatarImage(file: File, identifier: string): Promise<string> {
  const cleanId = (identifier || 'admin').replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // 1. Always generate high quality client compressed dataUrl
  const { dataUrl, blob } = await processAndCompressImage(file, {
    maxWidth: 500,
    maxHeight: 500,
    quality: 0.88,
    squareCrop: true,
  });

  // 2. Try Firebase Storage upload
  try {
    if (storage && blob.size > 0) {
      const filename = `avatars/${cleanId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    }
  } catch (storageError) {
    console.warn('Firebase Storage upload failed, falling back to optimized inline data URL:', storageError);
  }

  // 3. Fallback: ultra-fast dataUrl
  return dataUrl;
}
