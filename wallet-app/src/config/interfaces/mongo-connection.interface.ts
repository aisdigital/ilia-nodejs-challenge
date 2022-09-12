export interface IMongoConnection {
  name?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  uri: string;
}
