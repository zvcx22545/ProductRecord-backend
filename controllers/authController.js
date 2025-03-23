const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const fs = require("fs")
const path = require("path")
const dayjs = require('dayjs')

 const { getUserById , createUser } = require('../models/user')

 const ctrl = {}

module.exports = ctrl


//ตั้งค่าการอัปโหลดไฟล์

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

 // Register
ctrl.register = async (req, res) => {
    try {
        upload.single("profile_image")(req, res, async (err) => {
            if (err) {
                return res.status(400).send({
                    status: false,
                    message: err.message
                });
            }

            let { user_id, first_name, last_name, position, role, department, username, password } = req.body;

            console.log('Check user_id:', user_id);

            let checkUser = await getUserById(user_id); // เปลี่ยนจาก data เป็น user_id

            if (checkUser) {
                return res.status(400).send({ status: false, message: 'รหัสพนักงานถูกใช้งานแล้ว' });
            }

            let hashpassword = await bcrypt.hash(password, 10);
            let profile_image = req.body.profile_image
            let create_date = dayjs().toISOString()
            let update_date = dayjs().toISOString()

            let newUser = await createUser({
                user_id,
                first_name,
                last_name,
                position,
                role,
                department,
                password: hashpassword,
                profile_image,
                create_date,
                update_date
            });

            res.send({
                status: true,
                message: "User registered successfully",
                newUser
            });
        });
    } catch (e) {
        console.log('Error for create:', e);
        res.status(500).send({
            status: false,
            message: "Internal Server Error"
        });
    }
};

ctrl.login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await getUserByEmail(username);
      if (!user) {
        return res.status(400).json({ status: false, message: "Invalid credentials" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ status: false, message: "Invalid credentials" });
      }
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ status: true, message: "Login successful", token, profile_image: user.profile_image });
    } catch (error) {
      res.status(500).json({ status: false, message: "Error logging in", error: error.message });
    }
  };