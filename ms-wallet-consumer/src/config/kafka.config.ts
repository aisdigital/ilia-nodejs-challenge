export interface KafkaConfig {
  brokers: string[];
  groupId: string;
  clientId: string;
}

export const getKafkaConfig = (): KafkaConfig => ({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  groupId: process.env.KAFKA_GROUP_ID || 'wallet-consumer-group',
  clientId: process.env.KAFKA_CLIENT_ID || 'ms-wallet-consumer',
});
