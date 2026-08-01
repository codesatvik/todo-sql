require("dotenv/config")
const { PrismaNeon } = require("@prisma/adapter-neon");
const { PrismaClient } = require("./generated/prisma")

const adapter = new PrismaNeon({connectionString: process.env.DATABASE_URL})
const prisma = new PrismaClient({ adapter });
module.exports = prisma;