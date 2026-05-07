// express router setup
const router = require("express").Router()

// module imports
const { OnboardUser, UserAuth } = require("../../users/auth")

// middleware importations
const { AuthMiddleware } = require("../../middleware/authentication-middleware")

// routes set-up
router.post('/student-onboarding', OnboardUser)
router.post('/student-login', AuthMiddleware, UserAuth)



// export module
module.exports = router