const router = require("express").Router();

const { OnboardUser, UserAuth, VerifyEmail, ForgotPassword, ResetPassword ,CheckVerificationStatus} = require("../../users/auth");
const { AuthMiddleware } = require("../../middleware/authentication-middleware");

// public routes
router.post("/student-onboarding",  OnboardUser);
router.post("/student-login",       UserAuth);
router.get("/verify-email",         VerifyEmail);
router.post("/forgot-password",     ForgotPassword);
router.post("/reset-password", ResetPassword);
router.post("/check-verification-status", CheckVerificationStatus);


// example of a protected route — AuthMiddleware goes here
// router.get("/student-profile", AuthMiddleware, GetProfile);

module.exports = router;