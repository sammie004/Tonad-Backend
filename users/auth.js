const connection = require("../Config/db-config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ulid } = require("ulid");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();


// =========================================================
// MAILER SETUP
// =========================================================

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,       // e.g. smtp.gmail.com
    port: process.env.EMAIL_PORT || 587,
    secure: false,                      // true for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${process.env.APP_URL}/api/student/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"YourApp" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Confirm your email address — YourApp",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Verify your email</title>
        </head>
        <body style="margin:0;padding:0;background:#F1EFE8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0ddd4;">

                  <!-- Header -->
                  <tr>
                    <td style="background:#3C3489;padding:32px 40px 28px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom:24px;">
                            <table cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="background:rgba(255,255,255,0.15);border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;">
                                  <span style="font-size:18px;color:#ffffff;line-height:32px;">⚡</span>
                                </td>
                                <td style="padding-left:10px;font-size:15px;font-weight:500;color:#EEEDFE;letter-spacing:0.01em;">YourApp</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:22px;font-weight:500;color:#ffffff;line-height:1.3;padding-bottom:8px;">Confirm your email address</td>
                        </tr>
                        <tr>
                          <td style="font-size:14px;color:#AFA9EC;">You're one step away from getting started.</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 40px 0;">
                      <p style="font-size:15px;color:#5F5E5A;line-height:1.7;margin:0 0 24px;">
                        Hi there 👋 — thanks for signing up. Click the button below to verify your email address and activate your account.
                      </p>

                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                        <tr>
                          <td style="background:#3C3489;border-radius:8px;">
                            <a href="${verifyUrl}"
                               style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">
                              Verify my email &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Fallback link -->
                      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                        <tr>
                          <td style="background:#F1EFE8;border-radius:8px;padding:16px 20px;">
                            <p style="font-size:11px;font-weight:500;color:#888780;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;">Or copy this link</p>
                            <p style="font-size:12px;color:#B4B2A9;margin:0;word-break:break-all;font-family:monospace;">${verifyUrl}</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Meta info -->
                      <table cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #e0ddd4;padding-top:20px;">
                        <tr>
                          <td style="padding-bottom:8px;">
                            <p style="font-size:13px;color:#B4B2A9;margin:0;">🕐 &nbsp;This link expires in <strong style="color:#888780;">24 hours</strong></p>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p style="font-size:13px;color:#B4B2A9;margin:0;">🛡️ &nbsp;If you didn't create an account, you can safely ignore this.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #e0ddd4;margin-top:24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-size:12px;color:#B4B2A9;">© 2026 YourApp. All rights reserved.</td>
                          <td align="right" style="font-size:12px;color:#B4B2A9;">Lagos, NG</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>

        </body>
        </html>
        `,
    });
};


// =========================================================
// CHECK IF USER EXISTS
// =========================================================

const checkUserExists = (email) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM users WHERE email = ?";
        connection.query(query, [email], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};


// =========================================================
// USER ONBOARDING
// =========================================================

const OnboardUser = async (req, res) => {
    try {
        const {
            email, password, username,
            first_name, last_name, school_name,
            examination, current_class, state
        } = req.body;


        // =============================================
        // CHECK IF USER EXISTS
        // =============================================

        const existingUsers = await checkUserExists(email);

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }


        // =============================================
        // HASH PASSWORD
        // =============================================

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);


        // =============================================
        // GENERATE IDS & VERIFICATION TOKEN
        // =============================================

        const public_id = ulid();
        const verification_token = crypto.randomBytes(32).toString("hex");


        // =============================================
        // INSERT USER (unverified)
        // =============================================

        const insert_query = `
            INSERT INTO users (
                public_id, email, password_hash, username,
                first_name, last_name, school_name,
                examination, current_class, state,
                is_verified, verification_token
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?)
        `;

        await new Promise((resolve, reject) => {
            connection.query(
                insert_query,
                [
                    public_id, email, password_hash, username,
                    first_name, last_name, school_name,
                    examination, current_class, state,
                    verification_token
                ],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });


        // =============================================
        // SEND VERIFICATION EMAIL
        // =============================================

        await sendVerificationEmail(email, verification_token);


        return res.status(201).json({
            message: "Registration successful. Please check your email to verify your account.",
            user: { public_id, email, username, first_name, last_name }
        });

    } catch (error) {
        console.log("❌ Server Error", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


// =========================================================
// VERIFY EMAIL
// =========================================================

const VerifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: "Verification token is required" });
        }

        // Find user by token
        const findQuery = `
            SELECT * FROM users 
            WHERE verification_token = ? AND is_verified = FALSE
        `;

        const users = await new Promise((resolve, reject) => {
            connection.query(findQuery, [token], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid or expired verification token" });
        }

        const user = users[0];

        // Mark as verified and clear the token
        const updateQuery = `
            UPDATE users 
            SET is_verified = TRUE, verification_token = NULL 
            WHERE public_id = ?
        `;

        await new Promise((resolve, reject) => {
            connection.query(updateQuery, [user.public_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        return res.status(200).json({ message: "Email verified successfully. You can now log in." });

    } catch (error) {
        console.log("❌ Verify Email Error", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


// =========================================================
// USER LOGIN
// =========================================================

const UserAuth = async (req, res) => {
    try {
        const { email, password } = req.body;


        // =============================================
        // FIND USER
        // =============================================

        const users = await checkUserExists(email);

        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = users[0];


        // =============================================
        // CHECK EMAIL IS VERIFIED
        // =============================================

        if (!user.is_verified) {
            return res.status(403).json({
                error: "Please verify your email address before logging in."
            });
        }


        // =============================================
        // COMPARE PASSWORDS
        // =============================================

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }


        // =============================================
        // GENERATE TOKEN
        // =============================================

        const token = jwt.sign(
            { public_id: user.public_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                public_id: user.public_id,
                email: user.email,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });

    } catch (error) {
        console.log("❌ Login Error", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// =========================================================
// FORGOT PASSWORD
// =========================================================

const ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Always respond with 200 regardless of whether the email exists.
        // This prevents user enumeration attacks.
        const genericResponse = () => res.status(200).json({
            message: "If that email is registered, you'll receive a reset link shortly."
        });

        const users = await checkUserExists(email);
        if (users.length === 0) return genericResponse();

        const user = users[0];

        // =============================================
        // GENERATE RESET TOKEN (expires in 1 hour)
        // =============================================

        const reset_token = crypto.randomBytes(32).toString("hex");
        const reset_token_expires = Date.now() + 60 * 60 * 1000; // 1 hour from now

        const updateQuery = `
            UPDATE users 
            SET reset_token = ?, reset_token_expires = ?
            WHERE public_id = ?
        `;

        await new Promise((resolve, reject) => {
            connection.query(
                updateQuery,
                [reset_token, reset_token_expires, user.public_id],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        // =============================================
        // SEND RESET EMAIL
        // =============================================

        const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${reset_token}`;

        await transporter.sendMail({
            from: `"Your App" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Reset your password",
            html: `
                <h2>Password reset request</h2>
                <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
                <a href="${resetUrl}" style="
                    display:inline-block;padding:12px 24px;background:#4F46E5;
                    color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;
                ">Reset password</a>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
            `,
        });

        return genericResponse();

    } catch (error) {
        console.log("❌ Forgot Password Error", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


// =========================================================
// RESET PASSWORD
// =========================================================

const ResetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res.status(400).json({ error: "Token and new password are required" });
        }

        // =============================================
        // FIND USER BY TOKEN AND CHECK EXPIRY
        // =============================================

        const findQuery = `
            SELECT * FROM users
            WHERE reset_token = ?
        `;

        const users = await new Promise((resolve, reject) => {
            connection.query(findQuery, [token], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        const user = users[0];

        // Check token hasn't expired
        if (Date.now() > user.reset_token_expires) {
            return res.status(400).json({ error: "Reset token has expired. Please request a new one." });
        }

        // =============================================
        // HASH NEW PASSWORD
        // =============================================

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(new_password, salt);

        // =============================================
        // UPDATE PASSWORD AND CLEAR TOKEN
        // =============================================

        const updateQuery = `
            UPDATE users
            SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL
            WHERE public_id = ?
        `;

        await new Promise((resolve, reject) => {
            connection.query(
                updateQuery,
                [password_hash, user.public_id],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        return res.status(200).json({ message: "Password reset successfully. You can now log in." });

    } catch (error) {
        console.log("❌ Reset Password Error", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = {
    OnboardUser,
    VerifyEmail,
    UserAuth,
    ForgotPassword,   // <-- new
    ResetPassword     // <-- new
};