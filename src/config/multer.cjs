const  multer  = require('multer');
const {resolve} = require('node:path');
const { v4 } = require('uuid');

module.exports = {
    storage: multer.diskStorage({
        destination: resolve(__dirname, '..', '..', 'uploads'),
        filename: (_req, file, cb) => {
            const uniqueName = v4().concat(`-${file.originalname}`);
            return cb(null, uniqueName);
        }
    }),
};