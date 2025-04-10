const multer = require('multer');
const storage = multer.memoryStorage(); // ใช้ memory storage แทน disk
const upload = multer({ storage });
module.exports = upload;