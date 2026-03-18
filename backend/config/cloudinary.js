import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage Engine to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'iphone-ceylon-mobile', // The folder name in your Cloudinary account
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'], // Allowed file types
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // Auto-resize to save bandwidth
  },
});

export const upload = multer({ storage });
export { cloudinary };
