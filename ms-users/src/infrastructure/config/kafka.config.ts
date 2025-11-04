import { registerAs } from '@nestjs/config';

export interface KafkaConfig {
  brokers: string[];
}

export default registerAs('kafka', (): KafkaConfig => ({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
}));
