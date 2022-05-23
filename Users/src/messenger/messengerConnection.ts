import { Channel, Connection, MessengerConnection } from './messenger';

export class AmqpConnection implements MessengerConnection {
  readonly connectionString: string;
  private connection: Connection;
  private channel: Channel;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  async createConnection() {
    const amqplib = require('amqplib');
    if (!this.connection) this.connection = await amqplib.connect(this.connectionString);
    return this.connection;
  }

  async closeConnection() {
    await this.closeChannel();
    if (this.connection) await this.connection.close();
  }

  async createChannel() {
    const connection = await this.createConnection();
    if (!this.channel) this.channel = await connection.createChannel();
    return this.channel;
  }

  async closeChannel() {
    if (this.channel) await this.channel.close();
  }

  getChannel() {
    return this.channel;
  }
}
