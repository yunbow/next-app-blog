import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test user...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      username: "testuser",
      name: "Test User",
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log("Test user created:");
  console.log(`  Email: ${user.email}`);
  console.log(`  Username: ${user.username}`);
  console.log(`  Password: password123`);
  console.log(`  ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
