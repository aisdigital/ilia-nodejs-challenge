import { kafka } from "./kafka.js";
import jwt from "jsonwebtoken";

const producer = kafka.producer();

export async function publishUserCreated(
  userId: string,
  email: string
) {
  await producer.connect();

  const token = jwt.sign(
    {
      eventType: "USER_CREATED",
      payload: {
        userId,
        email,
      },
    },
    process.env.JWT_INTERNAL_SECRET as string,
    {
      expiresIn: "5m",
    }
  );

  await producer.send({
    topic: "users.events",
    messages: [
      {
        key: userId,
        value: token,
      },
    ],
  });
}
