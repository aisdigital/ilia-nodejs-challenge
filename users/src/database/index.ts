import { PrismaClient } from "@prisma/client";

export const connectDB = async () => {
  try {
    await new PrismaClient().$connect();
    console.log("Connected with DB! 📅");
  } catch (err) {
    console.error("Error connect with DB", err);
  }
};

export const disconnectDB = async () => {
  await new PrismaClient().$disconnect();
  setTimeout(() => {
    console.error("Disconnected from DB.");
    process.exit(0);
  }, 2000);
};
