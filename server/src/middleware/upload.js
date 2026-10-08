const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if env vars are present
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Local storage destination for fallback or staging
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype;

  const isAllowedExt = allowedExtensions.test(ext);
  const isAllowedMime =
    mimetype.includes('image/') ||
    mimetype === 'application/pdf' ||
    mimetype === 'application/octet-stream';

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPG, JPEG, and PNG files are accepted.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

/**
 * Upload helper that uploads to Cloudinary if configured, or returns local path URL.
 */
const uploadToCloudinaryOrLocal = async (file, folder = 'cloudmed_reports') => {
  const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (hasCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto',
      });
      // Remove temporary local file after Cloudinary upload
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}

      return {
        url: result.secure_url,
        publicId: result.public_id,
        isCloudinary: true,
      };
    } catch (cloudErr) {
      console.warn('[Cloudinary Warning] Upload failed, falling back to local storage:', cloudErr.message);
    }
  }

  // Fallback: Local URL served by express static
  const relativePath = `/uploads/${file.filename}`;
  return {
    url: relativePath,
    publicId: file.filename,
    isCloudinary: false,
  };
};

module.exports = {
  upload,
  uploadToCloudinaryOrLocal,
};
