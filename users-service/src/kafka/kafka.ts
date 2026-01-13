import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "users-service",
  brokers: ["localhost:9092"],
});
