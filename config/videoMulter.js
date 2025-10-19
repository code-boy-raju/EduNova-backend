// middlewares/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'videos/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/mkv', 'video/avi', 'video/mov'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid video format. Allowed: MP4, MKV, AVI, MOV.'));
};

// ✅ 1GB max (adjust as needed)
const limits = { fileSize: 1 * 1024 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
