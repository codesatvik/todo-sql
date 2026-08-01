const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
const dotenv = require("dotenv");
dotenv.config();
const z = require("zod");
const prisma = require("./prismaClient")
const bcrypt = require("bcrypt");


const SignupSchema = z.object({
  username: z.string().min(4),
  password: z.string().min(5),
  email: z.email(),
});

app.post("/signup", async (req, res) => {
  const { data, success, error } = SignupSchema.safeParse(req.body);
  if (!success) {
    res.status(403).json({ message: "incorrect inputs", error: JSON.parse(error) });
    return;
  }
  const username = data.username;
  const password = data.password;
  const email = data.email;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const response = await prisma.todouser1.create({
      data: {
        username,
        password: hashedPassword,
        email
      }
    })
    res.json({
      message: "signup done",
      id: response.id,
    });
  } catch (e) {
    res.status(403).json({ message: e.detail });
  }
});

app.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userExists = await prisma.todouser1.findUnique({ where: {email}})
  

  if (!userExists) {
    res.json({
      message: "incorrect credentials",
    });
  } else {
    const correctpassword = await bcrypt.compare(password, userExists.password);
    if (correctpassword) {

      const token = jwt.sign({ userId: userExists.id }, process.env.jwtSecret);
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
