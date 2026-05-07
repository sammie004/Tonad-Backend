// in-app dependencies
const express = require("express")
const dotenv = require("dotenv")
const connection = require("./Config/db-config")
const app = express()

//dependency usage
app.use(express.json())
dotenv.config()



// # routes and their usages



// set up the server to listen on a particular port
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})