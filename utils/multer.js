const multer = require('multer');
const storage = multer.memoryStorage(); // ใช้ memory storage แทน disk

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, webp and SVG files are allowed"), false);
    }
};


const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // optional: limit file size to 5MB
});
module.exports = upload;