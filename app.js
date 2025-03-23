require("dotenv").config()
const express = require('express')
const cors = require('cors')
const fs = require("fs")
const path = require("path")
const helmet = require("helmet");
const morgan = require("morgan");

const app = express()
app.use(cors())
app.use(express.json())
app.use(helmet());
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

app.use("/uploads", express.static("uploads"))

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ status: false, message: "Internal Server Error" })
  })

let PORT = process.env.PORT || 3000
app.listen(PORT , () => 
    console.log(`Server runnig on port ${PORT}`)
)