import { AmqpConnection } from './messengerConnection';

let messengerConnection: AmqpConnection;

export function createConnectionMessenger(connection: string) {
  messengerConnection = new AmqpConnection(connection);
  return messengerConnection.createConnection();
}

export function getChannel() {
  return messengerConnection.getChannel();
}
