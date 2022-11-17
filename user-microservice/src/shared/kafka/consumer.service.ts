import { EnvService } from '@config/env/env.service';
import { OnApplicationShutdown } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  constructor(private envService: EnvService) {}

  private readonly kafka = new Kafka({
    //TODO: passar para env
    brokers: [`${this.envService.kafkaBaseUrl}`],
  });
  private readonly consumers: Consumer[] = [];

  async consume(topic: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    const consumer = this.kafka.consumer({ groupId: 'transactions' });

    await consumer.connect();
    await consumer.subscribe(topic);
    await consumer.run(config);

    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
