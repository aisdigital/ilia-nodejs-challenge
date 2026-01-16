import fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';

import { connectDB } from './infrastructure/database/sequelize';
import jwtPlugin from './presentation/plugins/jwt';
import routes from './presentation/routes';
import { startGrpcServer } from './infrastructure/grpc/userGrpcServer';
import { IUserRepository } from './domain/repositories/IUserRepository';
import { UserRepository } from './infrastructure/repositories/UserRepository';

const app = fastify({ logger: true });

const start = async (): Promise<void> => {
  try {
    await app.register(cors);
    await app.register(jwtPlugin);
    await app.register(routes);

    await connectDB();

    const userRepository: IUserRepository = new UserRepository();
    startGrpcServer(userRepository);

    const port = config.server.port;
    const host = config.server.host;

    await app.listen({ port, host });
    console.log(`User Microservice running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
