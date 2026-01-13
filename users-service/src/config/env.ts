import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT ?? 3002),
  JWT_SECRET: process.env.JWT_SECRET ?? "ILIACHALLENGE",
};
