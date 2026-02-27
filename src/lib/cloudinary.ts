import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,      // Diperlukan di .env
  api_secret: process.env.CLOUDINARY_API_SECRET // Diperlukan di .env
});

export default cloudinary;
