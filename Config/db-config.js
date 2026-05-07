// =in-app dependencies
const mysql = require("mysql")
const dotenv = require("dotenv")
dotenv.config()

// create a connection to the database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

// test the connection to the database
connection.connect((err) => {
    if (err) {  
        console.log(`❌ Error creating connection to the database`)
        console.log(err)
    } else {
        console.log(`✅ Successfully connected to the database`)
    }
})

// export the connection for use in other files
module.exports = connection;
