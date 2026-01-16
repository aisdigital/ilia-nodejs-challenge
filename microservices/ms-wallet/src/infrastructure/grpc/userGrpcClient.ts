import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

const PROTO_PATH = config.grpc.protoPath || path.join(__dirname, '../../../../proto/users.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const usersProto = grpc.loadPackageDefinition(packageDefinition).users as any;

class UserGrpcClient {
  private client: any;

  constructor() {
    this.client = new usersProto.UserService(
      `${config.grpc.userService.host}:${config.grpc.userService.port}`,
      grpc.credentials.createInsecure()
    );
  }

  async validateUser(userId: string): Promise<{ valid: boolean; user?: any; error?: string }> {
    return new Promise((resolve, reject) => {
      const token = jwt.sign({}, config.jwt.internalSecret, { expiresIn: '1m' });

      this.client.ValidateUser(
        { user_id: userId, internal_token: token },
        (error: any, response: any) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(response);
        }
      );
    });
  }
}

export const userGrpcClient = new UserGrpcClient();
