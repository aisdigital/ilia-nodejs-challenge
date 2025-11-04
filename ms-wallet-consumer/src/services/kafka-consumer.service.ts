import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { getKafkaConfig } from '../config/kafka.config';
import { UserCreatedHandler, UserCreatedEvent } from '../handlers/user-created.handler';

export class KafkaConsumerService {
  private kafka: Kafka;
  private consumer: Consumer;
  private userCreatedHandler: UserCreatedHandler;
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000;

  constructor() {
    const config = getKafkaConfig();
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
    });
    this.consumer = this.kafka.consumer({ groupId: config.groupId });
    this.userCreatedHandler = new UserCreatedHandler();
  }

  async start(): Promise<void> {
    await this.consumer.connect();
    console.log('Kafka consumer connected');

    await this.consumer.subscribe({
      topic: 'user-events',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      },
    });

    console.log('Kafka consumer listening to user-events topic');
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;

    if (!message.value) {
      console.warn('Received message with empty value');
      return;
    }

    let retryCount = 0;
    let success = false;

    while (retryCount < this.maxRetries && !success) {
      try {
        const event: UserCreatedEvent = JSON.parse(message.value.toString());

        console.log(`Processing message from ${topic} partition ${partition}`, {
          offset: message.offset,
          attempt: retryCount + 1,
        });

        await this.userCreatedHandler.handle(event);
        success = true;

        console.log('Message processed successfully', {
          offset: message.offset,
        });
      } catch (error) {
        retryCount++;
        console.error(`Error processing message (attempt ${retryCount}/${this.maxRetries}):`, error);

        if (retryCount < this.maxRetries) {
          console.log(`Retrying in ${this.retryDelay}ms...`);
          await this.sleep(this.retryDelay);
        } else {
          console.error('Max retries reached, sending to DLQ');
          await this.sendToDLQ(message.value.toString(), error);
        }
      }
    }
  }

  private async sendToDLQ(messageValue: string, error: any): Promise<void> {
    try {
      const producer = this.kafka.producer();
      await producer.connect();

      await producer.send({
        topic: 'user-events-dlq',
        messages: [
          {
            value: JSON.stringify({
              originalMessage: messageValue,
              error: error.message,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });

      await producer.disconnect();
      console.log('Message sent to DLQ successfully');
    } catch (dlqError) {
      console.error('Failed to send message to DLQ:', dlqError);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
    console.log('Kafka consumer disconnected');
  }
}
