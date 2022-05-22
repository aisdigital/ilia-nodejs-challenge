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
  assertQueue(queue: string, options?: Options.AssertQueue): Promise<any>;
  sendToQueue(queue: string, content: Buffer, options?: any): boolean;
}
