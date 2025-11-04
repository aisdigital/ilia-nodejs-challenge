import 'dotenv/config';
import { KafkaConsumerService } from './services/kafka-consumer.service';
import { DatabaseService } from './services/database.service';

async function bootstrap() {
  console.log('Starting MS Wallet Consumer...');

  try {
    await DatabaseService.getConnection();

    const kafkaConsumer = new KafkaConsumerService();
    await kafkaConsumer.start();

    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}, shutting down gracefully...`);
      await kafkaConsumer.stop();
      await DatabaseService.closeConnection();
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    console.log('MS Wallet Consumer is running');
  } catch (error) {
    console.error('Failed to start MS Wallet Consumer:', error);
    process.exit(1);
  }
}

bootstrap();
