import { EnvService } from '@config/env/env.service';
import {
  OnApplicationShutdown,
  OnModuleInit,
  Injectable,
} from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  constructor(private envService: EnvService) {}

  private readonly kafka = new Kafka({
    //TODO: passar para env
    brokers: [`${this.envService.kafkaBaseUrl}`],
  });

  private readonly producer: Producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
  }

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
