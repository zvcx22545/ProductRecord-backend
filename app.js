require("dotenv").config()
const express = require('express')
const cors = require('cors')
const fs = require("fs")
const path = require("path")

const app = express()
app.use(cors())
app.use(express.json())

fs.readdirSync(path.join(__dirname,'api')).forEach(file => {
    const route = require(`./api/${file}`)
    const routePath = `/${file.split(".")[0]}`
    app.use(routePath, route)
})

let PORT = process.env.PORT || 3000;
app.listen(PORT , () => 
    console.log(`Server runnig on port ${port}`)
)