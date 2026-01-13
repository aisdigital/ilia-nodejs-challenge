import { kafka } from "./kafka.js";
import jwt from "jsonwebtoken";
import { WalletRepository } from "../modules/wallet/wallet.repository.js";
import { Wallet } from "../modules/wallet/entities/wallet.entity.js";
import { randomUUID } from "crypto";

const consumer = kafka.consumer({ groupId: "wallet-group" });

export async function startUserConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topic: "users.events",
    fromBeginning: true,
  });

  const repository = new WalletRepository();

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      let decoded: any;

      try {
        decoded = jwt.verify(
          message.value.toString(),
          process.env.JWT_INTERNAL_SECRET as string
        );
      } catch {
        return;
      }

      if (decoded.eventType !== "USER_CREATED") return;

      const { userId } = decoded.payload;

      const existing = await repository.findWalletByUser(userId);
      if (existing) return;

      const wallet = new Wallet(
        randomUUID(),
        userId,
        0,
        new Date()
      );

      await repository.createWallet(wallet);
    },
  });
}
