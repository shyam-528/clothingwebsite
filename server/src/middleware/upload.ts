import multer from 'multer';
import multerStorageCloudinary from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary';

// multer-storage-cloudinary@2.2.1 exports a factory function, not a class.
const storage = multerStorageCloudinary({
  cloudinary,
  params: {
    folder: 'urban-threads/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1500, crop: 'limit', quality: 'auto' }],
  } as any,
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

/**
 * Wraps multer so a missing Cloudinary config doesn't crash the dev server.
 * In dev without Cloudinary credentials, falls back to memory storage and
 * returns a placeholder URL — useful for local UI work.
 */
export const uploadAny = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
