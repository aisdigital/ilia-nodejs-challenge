import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  JWT_SECRET: process.env.JWT_SECRET ?? "ILIACHALLENGE",
};
