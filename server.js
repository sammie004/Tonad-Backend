// in-app dependencies
const express = require("express")
const dotenv = require("dotenv")
const connection = require("./Config/db-config")
const cors = require("cors")
const app = express()

//dependency usage
app.use(express.json())
dotenv.config()


// route imports
const userAuth = require("./routes/user/user-Auth")
// # routes  usages
app.use('/api/student',userAuth)


// set up the server to listen on a particular port
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})