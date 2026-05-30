const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Attempting database connection...");
    const count = await prisma.user.count();
    console.log("Successfully connected! User count:", count);
    const users = await prisma.user.findMany({
      take: 2,
      select: { id: true, name: true, email: true, role: true }
    });
    console.log("Sample users:", JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Database connection failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
