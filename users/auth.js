const connection = require("../Config/db-config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ulid } = require("ulid");
const dotenv = require("dotenv");

dotenv.config();


// =========================================================
// CHECK IF USER EXISTS
// =========================================================

const checkUserExists = (email) => {
    return new Promise((resolve, reject) => {

        const query = "SELECT * FROM users WHERE email = ?";

        connection.query(query, [email], (err, results) => {

            if (err) {
                reject(err);
            } else {
                resolve(results);
            }

        });

    });
};


// =========================================================
// USER ONBOARDING
// =========================================================

const OnboardUser = async (req, res) => {

    try {

        const {
            email,
            password,
            username,
            first_name,
            last_name,
            school_name,
            examination,
            current_class,
            state
        } = req.body;


        // =============================================
        // CHECK IF USER EXISTS
        // =============================================

        const existingUsers = await checkUserExists(email);

        if (existingUsers.length > 0) {
            return res.status(400).json({
                error: "User already exists"
            });
        }


        // =============================================
        // HASH PASSWORD
        // =============================================

        const salt = await bcrypt.genSalt(10);

        const password_hash = await bcrypt.hash(password, salt);


        // =============================================
        // GENERATE PUBLIC ID
        // =============================================

        const public_id = ulid();


        // =============================================
        // INSERT USER
        // =============================================

        const insert_query = `
            INSERT INTO users (
                public_id,
                email,
                password_hash,
                username,
                first_name,
                last_name,
                school_name,
                examination,
                current_class,
                state
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        connection.query(
            insert_query,
            [
                public_id,
                email,
                password_hash,
                username,
                first_name,
                last_name,
                school_name,
                examination,
                current_class,
                state
            ],
            (err, results) => {

                if (err) {

                    console.log("❌ Error inserting user");
                    console.log(err);

                    return res.status(500).json({
                        error: "Internal server error"
                    });

                }


                // =====================================
                // GENERATE JWT
                // =====================================

                const token = jwt.sign(
                    {
                        public_id,
                        email
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "1h"
                    }
                );


                return res.status(201).json({
                    message: "User onboarded successfully",
                    token,
                    user: {
                        public_id,
                        email,
                        username,
                        first_name,
                        last_name
                    }
                });

            }
        );

    } catch (error) {

        console.log("❌ Server Error");
        console.log(error);

        return res.status(500).json({
            error: "Internal server error"
        });

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

            return res.status(401).json({
                error: "Invalid credentials"
            });

        }

        const user = users[0];


        // =============================================
        // COMPARE PASSWORDS
        // =============================================

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {

            return res.status(401).json({
                error: "Invalid credentials"
            });

        }


        // =============================================
        // GENERATE TOKEN
        // =============================================

        const token = jwt.sign(
            {
                public_id: user.public_id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
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

        console.log("❌ Login Error");
        console.log(error);

        return res.status(500).json({
            error: "Internal server error"
        });

    }

};


module.exports = {
    OnboardUser,
    UserAuth
};