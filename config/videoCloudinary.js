// config/videoCloudinary.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Upload large videos safely (using streams)
const videoUpload = async (filePath) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'edunova_project_videos',
        chunk_size: 80 * 1024 * 1024 , // 10MB chunks
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload failed:', error);
          return reject(error);
        }
        console.log('✅ Cloudinary upload success:', {
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
        resolve(result);
      }
    );

    fs.createReadStream(filePath).pipe(uploadStream);
  });
};

module.exports = { videoUpload };
