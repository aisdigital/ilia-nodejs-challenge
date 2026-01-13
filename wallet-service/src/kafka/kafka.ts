import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "wallet-service",
  brokers: ["localhost:9092"],
});
