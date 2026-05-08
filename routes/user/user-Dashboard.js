const express = require("express")
const router = express.Router()

const { AuthMiddleware } = require("../../middleware/authentication-middleware")
const { GetStudentDashboard } = require("../../users/dashboard")

router.get("/dashboard", AuthMiddleware(), GetStudentDashboard)

module.exports = router