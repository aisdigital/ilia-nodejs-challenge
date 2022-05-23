export interface MessengerConnection {
  createConnection(): Promise<Connection>;
  closeConnection(): Promise<void>;
  createChannel(): Promise<Channel>;
  closeChannel(): Promise<void>;
  getChannel(): Channel;
}

export interface Connection {
  close(): Promise<void>;
  createChannel(): Promise<Channel>;
}

export interface Channel {
  close(): Promise<void>;
  assertQueue(queue: string, options?: any): Promise<any>;
  sendToQueue(queue: string, content: any, options?: any): boolean;
  consume(queue: string, onMessage: (msg: any | null) => void, options?: any): Promise<any>;
  ack(message: any | null): void;
}
