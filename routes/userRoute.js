const express = require('express')
const { userRegister } = require('../controller/userController')
const router = express.Router()
// router.route("reg/").post(userRegister)

exports.default = router