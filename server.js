// in-app dependencies
const express = require("express")
const dotenv = require("dotenv")
const connection = require("./Config/db-config")
const cors = require("cors")
const app = express()

//dependency usage
app.use(express.json())
dotenv.config()

// cors configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://mayflower-skating-gnat.ngrok-free.dev"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some((allowedOrigin) =>
      origin.startsWith(allowedOrigin)
    );
    if (isAllowed) return callback(null, true);
    return callback(new Error("CORS blocked for origin: " + origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],  
  credentials: true
}));

// app.use(cors());
// app.options(/.*/, cors());

// route imports
const userAuth = require("./routes/user/user-Auth")
const dashboard = require("./routes/user/user-Dashboard")
// # routes  usages
app.use('/api/student', userAuth)
app.use('/api/student', dashboard)


// set up the server to listen on a particular port
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})