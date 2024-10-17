const express = require('express')
const { renderLoginPage, handleLogin, handleLogout } = require('../controller/auth/authController')
const router = express.Router()

router.route('/login')
.get(renderLoginPage)
.post(handleLogin)

router.route('/logout').get(handleLogout)

module.exports= router