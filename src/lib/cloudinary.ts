import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary 伺服器端配置
 */
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

export default cloudinary;