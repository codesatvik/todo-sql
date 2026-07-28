const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
const dotenv = require("dotenv");
dotenv.config();
const { Pool } = require("pg");
const z = require("zod");
const bcrypt = require("bcrypt");

const pool = new Pool({
  connectionString: process.env.neondbLink,
});
const SignupSchema = z.object({
  username: z.string().min(4),
  password: z.string().min(5),
  email: z.email(),
});

app.post("/signup", async (req, res) => {
  const { data, success, error } = SignupSchema.safeParse(req.body);
  if (!success) {
    res
      .status(403)
      .json({ message: "incorrect inputs", error: JSON.parse(error) });
    return;
  }
  const username = data.username;
  const password = data.password;
  const email = data.email;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const response = await pool.query(
      `INSERT INTO todousers (username, password, email) VALUES ($1, $2, $3) RETURNING id`,
      [username, hashedPassword, email],
    );
    res.json({
      message: "signup done",
      id: response.rows[0].id,
    });
  } catch (e) {
    res.status(403).json({ message: e.detail });
  }
});

app.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //const response = await pool.query(`SELECT * FROM users WHERE email="${email}" AND password="${password}"`);
  const response = await pool.query(`SELECT * FROM todousers WHERE email=$1`, [
    email,
  ]);
  const userExists = response.rows[0];

  if (!userExists) {
    res.json({
      message: "incorrect credentials",
    });
  } else {
    const correctpassword = await bcrypt.compare(password, userExists.password);
    const token = jwt.sign({ userId: userExists.id }, process.env.jwtSecret);
    if (correctpassword) {
      res.json({
        message: "signed in",
        token: token,
      });
    } else {
      res.json({ message: "incorrect creds" });
    }
  }
});
app.listen(3000, () => {
  console.log("listening to port 3000");
});
