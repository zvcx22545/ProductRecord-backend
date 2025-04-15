const express = require("express")
const auth = require("../../controllers/authController")

const router = express.Router()

router.post("/register", auth.register)
router.post("/login", auth.login)
router.get('/getUserByid/:user_id', auth.getUserByUserid)
router.post('/updateUser', auth.updateUser)
module.exports = router
