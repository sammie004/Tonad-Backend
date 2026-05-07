const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const connection = require("../Config/db-config");

dotenv.config();


// =========================================================
// AUTHENTICATION MIDDLEWARE
// =========================================================

const AuthMiddleware = (requiredRoles = []) => {

    return (req, res, next) => {

        try {

            // =====================================================
            // GET AUTHORIZATION HEADER
            // =====================================================

            const authHeader = req.headers.authorization;

            if (!authHeader) {

                return res.status(401).json({
                    success: false,
                    error: "Authorization header missing"
                });

            }


            // =====================================================
            // VALIDATE BEARER TOKEN FORMAT
            // =====================================================

            const parts = authHeader.split(" ");

            if (
                parts.length !== 2 ||
                parts[0] !== "Bearer"
            ) {

                return res.status(401).json({
                    success: false,
                    error: "Invalid authorization format"
                });

            }

            const token = parts[1];


            // =====================================================
            // VERIFY JWT TOKEN
            // =====================================================

            jwt.verify(
                token,
                process.env.JWT_SECRET,
                (err, decoded) => {

                    if (err) {

                        console.log("❌ JWT Verification Error");
                        console.log(err);

                        if (err.name === "TokenExpiredError") {

                            return res.status(401).json({
                                success: false,
                                error: "Token expired"
                            });

                        }

                        return res.status(401).json({
                            success: false,
                            error: "Invalid token"
                        });

                    }


                    // =================================================
                    // ENSURE TOKEN PAYLOAD EXISTS
                    // =================================================

                    if (!decoded.public_id) {

                        return res.status(401).json({
                            success: false,
                            error: "Invalid token payload"
                        });

                    }


                    // =================================================
                    // FETCH USER FROM DATABASE
                    // =================================================

                    const userQuery = `
                        SELECT 
                            users.id,
                            users.public_id,
                            users.first_name,
                            users.last_name,
                            users.username,
                            users.email,
                            users.status,
                            users.is_verified,
                            roles.name AS role
                        FROM users
                        LEFT JOIN user_roles
                            ON users.id = user_roles.user_id
                        LEFT JOIN roles
                            ON user_roles.role_id = roles.id
                        WHERE users.public_id = ?
                    `;

                    connection.query(
                        userQuery,
                        [decoded.public_id],
                        (err, results) => {

                            if (err) {

                                console.log("❌ Database Error");
                                console.log(err);

                                return res.status(500).json({
                                    success: false,
                                    error: "Database error"
                                });

                            }


                            // =========================================
                            // USER NOT FOUND
                            // =========================================

                            if (results.length === 0) {

                                return res.status(401).json({
                                    success: false,
                                    error: "User not found"
                                });

                            }


                            // =========================================
                            // USER DATA
                            // =========================================

                            const user = {
                                id: results[0].id,
                                public_id: results[0].public_id,
                                first_name: results[0].first_name,
                                last_name: results[0].last_name,
                                username: results[0].username,
                                email: results[0].email,
                                status: results[0].status,
                                is_verified: results[0].is_verified,
                                roles: results
                                    .map(r => r.role)
                                    .filter(Boolean)
                            };


                            // =========================================
                            // CHECK ACCOUNT STATUS
                            // =========================================

                            if (user.status === "BANNED") {

                                return res.status(403).json({
                                    success: false,
                                    error: "Account has been banned"
                                });

                            }

                            if (user.status === "SUSPENDED") {

                                return res.status(403).json({
                                    success: false,
                                    error: "Account suspended"
                                });

                            }


                            // =========================================
                            // ROLE AUTHORIZATION
                            // =========================================

                            if (
                                requiredRoles.length > 0
                            ) {

                                const hasRequiredRole =
                                    requiredRoles.some(role =>
                                        user.roles.includes(role)
                                    );

                                if (!hasRequiredRole) {

                                    return res.status(403).json({
                                        success: false,
                                        error: "Insufficient permissions"
                                    });

                                }

                            }


                            // =========================================
                            // ATTACH USER TO REQUEST
                            // =========================================

                            req.user = user;


                            // =========================================
                            // CONTINUE
                            // =========================================

                            next();

                        }
                    );

                }
            );

        } catch (error) {

            console.log("❌ Authentication Middleware Error");
            console.log(error);

            return res.status(500).json({
                success: false,
                error: "Internal server error"
            });

        }

    };

};

module.exports = AuthMiddleware;