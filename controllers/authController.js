const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require("fs")
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const path = require("path")
const stream = require('stream');
const dayjs = require('dayjs')
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(timezone);

const { getUserById, createUser, updateUserById } = require('../models/user');
const ctrl = {}

module.exports = ctrl


//ตั้งค่าการอัปโหลดไฟล์

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const userid = req.body.user_id; // แก้ไขจาก userid เป็น user_id
//         const uploadPath = `upload/user/${userid}`;

//         // ทำการเช็คว่า User มีโฟลเดอร์หรือไม่
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//         }

//         cb(null, uploadPath);
//     },

//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });



// const upload = multer({ storage, fileFilter });

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
    const { user_id, password } = req.body;

    try {

        if (!user_id && user_id === '') {
            return res.status(400).json({ status: false, message: "กรุณากรอกรหัสพนักงาน" });
        } else if (!password && password === '') {
            return res.status(400).json({ status: false, message: "กรุณากรอกรหัสผ่าน" });
        }

        const user = await getUserById(user_id);
        if (!user) {
            return res.status(400).json({ status: false, message: "ไม่มีผู้ใช้งานนี้ในระบบ กรุณาสมัครสมาชิก" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ status: false, message: "รหัสผ่านไม่ถูกต้อง" });
        }
        const expiresIn = 60 * 60
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn });
        //   const expiresAt = dayjs().add(expiresIn, "second").toISOString()
        const expiresAt = dayjs().add(expiresIn, "second").tz('Asia/Bangkok').format('DD:MM:YYYY HH:mm:ss');

        res.send({
            status: true, message: "เข้าสู่ระบบสำเร็จ",
            token,
            expiresAt,
            profile_image: user.profile_image,
            userid: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            department: user.department,
            position: user.position,
            create_date: user.create_date,
            update_date: user.update_date
        });
    } catch (error) {
        res.status(500).json({ status: false, message: "กรุณากรอกข้อมูลให้ถูกต้อง", error: error.message });
    }
};

ctrl.getUserByUserid = async (req, res) => {
    try {

        const user_id = req.params.user_id;
        const row = await getUserById(user_id)

        res.send({
            status: true,
            message: 'get User successfully',
            row
        })
    } catch (error) {
        console.log('error to get Profile', error)
        res.status(500).json({ status: false, message: "เกิดข้อผิดพลาดในการโหลดข้อมูล", error: error.message });
    }
}

ctrl.updateUser = async (req, res) => {
    try {
        const uploadMiddleware = upload.single('profile_image')
        uploadMiddleware(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                })
            }
            const updatedUser = req.body
            // console.log('check updatedUser ==>', updatedUser)
            // อัปโหลดไปยัง Cloudinary
            const userFolder = `user/${updatedUser.user_id}`; // สร้าง folder ตาม user_if
            const existingUser = await getUserById(updatedUser.user_id);
            const oldPublicId = existingUser?.profile_image_public_id;
            const bufferStream = new stream.PassThrough();
            if (req.file) {
                bufferStream.end(req.file.buffer);
            }

            const uploadFromBuffer = () => {
                return new Promise((resolve, reject) => {
                    const cloudinaryStream = cloudinary.uploader.upload_stream(
                        { folder: userFolder }, // ตำแหน่งจัดเก็บ
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );

                    bufferStream.pipe(cloudinaryStream);
                });
            };

            let imageUrl = updatedUser ? updatedUser.profile_image : null;
            let imagePublicId = oldPublicId || null;
            if (req.file) {
                 // 🔥 ลบรูปเดิมใน Cloudinary ถ้ามี
                 if (oldPublicId) {
                    try {
                        await cloudinary.uploader.destroy(oldPublicId);
                        console.log('ลบรูปโปรไฟล์เดิมสำเร็จ:', oldPublicId);
                    } catch (deleteErr) {
                        console.error('ลบรูปโปรไฟล์เดิมไม่สำเร็จ:', deleteErr);
                    }
                }

                const result = await uploadFromBuffer();
                imageUrl = result.secure_url;
                imagePublicId = result.public_id;

            }

            const rowUpdate = await updateUserById(updatedUser, imageUrl, imagePublicId)
            console.log('check rowUpdate ==>', rowUpdate)
            res.send({
                status: true,
                message: 'Update User successfully',
                rowUpdate
            })
        })


    } catch (error) {
        console.log('error to get Profile', error)
        res.status(500).json({ status: false, message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล", error: error.message });
    }

}

