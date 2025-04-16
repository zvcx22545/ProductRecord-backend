require("dotenv").config();
const express = require('express');
const cors = require('cors');
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// กำหนด CORS options ให้เหมาะสม
const corsOptions = {
  origin: '*', // หรือกำหนด domain ที่คุณต้องการอนุญาต เช่น 'http://localhost:5173'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: true, // ให้ preflight continue ได้
  optionsSuccessStatus: 204, // ส่ง status 204 สำหรับ preflight request
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // กำหนดให้ตอบสนองกับทุก path

app.use(express.json());
app.use(helmet());

// เพิ่ม header สำหรับ Cross-Origin Resource Policy
app.use("/upload", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use(morgan("combined"));

// โหลด API อัตโนมัติจากโฟลเดอร์ `api`
const loadRoutes = (dir, basePath = "/api") => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      loadRoutes(fullPath, `${basePath}/${file}`);
    } else if (file.endsWith(".js")) {
      const route = require(fullPath);
      app.use(basePath, route);
      console.log(`API Loaded: ${basePath}`);
    }
  });
};

loadRoutes(path.join(__dirname, "api"));

// Static file serving (make sure the path is correct for Vercel deployment)
app.use("/upload", express.static(path.join(__dirname, 'upload')));

// If Vercel doesn't find a route, make sure it returns a fallback index.html (important for SPAs)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: false, message: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
module.exports = app;
