import { Injectable } from '@nestjs/common';
import { Client, ClientRMQ, Transport } from '@nestjs/microservices';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  @Client({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: 'create-transaction',
      queueOptions: {
        durable: false,
      },
    },
  })
  client: ClientRMQ;

  createUserTransaction(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ) {
    return this.client.emit('create-transaction', {
      userId,
      ...createTransactionDto,
    });
  }

  listUserTransactions(userId: string) {
    return this.client.send('list-transactions', userId);
  }

  getUserBalance(userId: string) {
    return this.client.send('get-balance', userId);
  }
}
