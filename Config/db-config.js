const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();


// =====================================================
// CREATE MYSQL CONNECTION POOL
// =====================================================

const connection = mysql.createPool({
    connectionLimit: 10, // number of simultaneous connections
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


// =====================================================
// TEST POOL CONNECTION
// =====================================================

    connection.getConnection((err, connection) => {

    if (err) {
        console.log("❌ Error connecting to database pool");
        console.log(err);
        return;
    }

    if (connection) {
        console.log("✅ MySQL connection pool ready");
        connection.release(); // return connection back to pool
    }

});


// =====================================================
// EXPORT POOL (NOT SINGLE CONNECTION)
// =====================================================

module.exports = connection;