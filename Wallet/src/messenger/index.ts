import { AmqpConnection } from './messengerConnection';

let messengerConnection: AmqpConnection;

export async function createConnectionMessenger(connection: string) {
  messengerConnection = new AmqpConnection(connection);
  await messengerConnection.createConnection();
  await messengerConnection.createChannel();
}

export function getChannel() {
  return messengerConnection.getChannel();
}
