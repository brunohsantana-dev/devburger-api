const multer = require('multer');
const { resolve } = require('node:path');
const { v4 } = require('uuid');

const imageTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

module.exports = {
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 10, parts: 11 },
  fileFilter: (_req, file, cb) => {
    if (!imageTypes[file.mimetype]) {
      const error = new Error('Only JPEG, PNG and WebP images are allowed');
      error.code = 'INVALID_IMAGE';
      return cb(error);
    }
    return cb(null, true);
  },
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'uploads'),
    filename: (_req, file, cb) => {
      const uniqueName = v4().concat(imageTypes[file.mimetype]);
      return cb(null, uniqueName);
    },
  }),
};
