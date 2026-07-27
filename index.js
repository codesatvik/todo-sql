const express = require("express");
const jwt = require("jsonwebtoken")
const app = express();
app.use(express.json())
const dotenv = require("dotenv");
dotenv.config();
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.neondbLink
})
app.post("/signup", async (req, res) => { 
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    try {
        const response = await pool.query(`INSERT INTO todousers (username, password, email) VALUES ($1, $2, $3) RETURNING id`, [username, password, email])
        res.json({
        message: "signup done",
        id : response.rows[0].id
    })
    } catch (e) {
        console.log(e)
        res.status(403).json({message:e.detail})
    }
   
})  

app.post("/signin",  async (req, res) => { 
    const email = req.body.email;
    const password = req.body.password;
    //const response = await pool.query(`SELECT * FROM users WHERE email="${email}" AND password="${password}"`);
    const response = await pool.query(`SELECT * FROM todousers WHERE email=$1 AND password=$2`, [email, password]);
    const userExists = response.rows[0];

    if (!userExists) {
        res.json({
            message: "incorrect credentials"
        })
    }
    const token = jwt.sign({
        userId: userExists.id
    },process.env.jwtSecret)
    
        res.json({
            message: "signed in",
            token: token
        })
    

})
app.listen(3000, () => { console.log("listening to port 3000")})