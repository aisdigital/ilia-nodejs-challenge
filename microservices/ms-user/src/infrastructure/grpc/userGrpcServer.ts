import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
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

function createValidateUserHandler(userRepository: IUserRepository) {
  return async function validateUser(call: any, callback: any) {
    const { user_id, internal_token } = call.request;

    try {
      jwt.verify(internal_token, config.jwt.internalSecret);

      const user = await userRepository.findById(user_id);

      if (!user) {
        callback(null, {
          valid: false,
          error: 'User not found',
        });
        return;
      }

      callback(null, {
        valid: true,
      });
    } catch (error) {
      callback(null, {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token',
      });
    }
  };
}

export function startGrpcServer(userRepository: IUserRepository): void {
  const server = new grpc.Server();

  server.addService(usersProto.UserService.service, {
    ValidateUser: createValidateUserHandler(userRepository),
  });

  server.bindAsync(
    `0.0.0.0:${config.grpc.port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start gRPC server:', error);
        return;
      }
      console.log(`gRPC server running on port ${port}`);
    }
  );
}
