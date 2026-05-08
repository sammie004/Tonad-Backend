// in-app dependencies
const connection = require("../Config/db-config")
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
const jwt = requre("jswonwebtoken")
dotenv.config()
// function to check if the user exists
const CheckUserExists = (email) => {
    return new promises((resolve, reject) => {
        const sql = `select * from admins where email = ?`
        connection.query(sql, [email], (err, results) => {
            if (err) {
                reject(err)
            } else {
                resolve(results)
            }
        })
    })
}
// function to handle user (admin) authentication
const adminLogin = (req, res) => {
    const { email, password } = req.body
    
    const userExists = await CheckUserExists(email)

    if (userExists.length > 0) {
        const user = userExists[0]
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            console.log(`Invalid email entered for ${user.email}`)
            return res.status(401).json({message:`Invalid email or password`})
        } else {
            const token = jwt.sign({ public_id: user.public_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
            return res.status(200).json({ message: `Welcome`, token, username:user.username})
        }
    }
}

module.exports = {adminLogin}