const multer = require('multer')
const fs = require("fs")
const dayjs = require('dayjs')
const ctrl = {}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userid = req.body.user_id; // แก้ไขจาก userid เป็น user_id
        const uploadPath = `upload/user/${userid}`;

        // ทำการเช็คว่า User มีโฟลเดอร์หรือไม่
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Upload only JPG, PNG, and SVG are allowed"));
    }
};

const upload = multer({ storage, fileFilter });