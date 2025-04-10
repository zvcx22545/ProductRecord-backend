require("dotenv").config()
const express = require('express')
const cors = require('cors')
const fs = require("fs")
const path = require("path")
const helmet = require("helmet");
const morgan = require("morgan");

const app = express()

// กำหนด CORS options ให้เหมาะสม
const corsOptions = {
  origin: '*', // หรือกำหนด domain ที่คุณต้องการอนุญาต เช่น 'http://localhost:5173'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // กำหนด methods ที่อนุญาต
  allowedHeaders: ['Content-Type', 'Authorization'], // กำหนด headers ที่อนุญาต
  preflightContinue: false, // ให้ตอบสนองด้วย CORS headers โดยอัตโนมัติ
  optionsSuccessStatus: 204, // ส่ง status 204 สำหรับ preflight request
};

app.use(cors(corsOptions));

// ตั้งค่ารับ OPTIONS request สำหรับ preflight
app.options('*', cors(corsOptions));


app.use(express.json())
app.use(helmet());

// เพิ่ม header สำหรับ Cross-Origin Resource Policy
app.use("/upload", (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // ใช้ cross-origin เพื่ออนุญาตการโหลดรูปข้าม origin
    next();
});app.use("/upload", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // ใช้ cross-origin เพื่ออนุญาตการโหลดรูปข้าม origin
  next();
});
app.use(morgan("combined"));

const loadRoutes = (dir, basePath = "/api") => {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file)
        const stat = fs.lstatSync(fullPath)

        if (stat.isDirectory()) {
            loadRoutes(fullPath, `${basePath}/${file}`)
        } else if (file.endsWith(".js")) {
            const route = require(fullPath)
            app.use(basePath, route)
            console.log(`API Loaded: ${basePath}`)
        }
    })
}

// โหลด API อัตโนมัติจากโฟลเดอร์ `api`
loadRoutes(path.join(__dirname, "api"))

app.use("/upload", express.static("upload"))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ status: false, message: "Internal Server Error" })
  })

// let PORT = process.env.PORT || 3000
// app.listen(PORT , () => 
//     console.log(`Server runnig on port ${PORT}`)
// )

module.exports = app;
