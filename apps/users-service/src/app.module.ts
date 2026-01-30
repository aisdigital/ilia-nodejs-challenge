import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './modules/user/entities/user.entity';

const walletGrpcUrl = process.env.WALLET_GRPC_URL || 'localhost:50053';
const protoPath =
  process.env.NODE_ENV === 'test'
    ? join(process.cwd(), 'proto', 'wallet.proto')
    : join(__dirname, '../../proto/wallet.proto');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'WALLET_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'wallet',
          protoPath,
          url: walletGrpcUrl,
        },
      },
    ]),
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot(
      process.env.DB_TYPE === 'sqlite'
        ? {
            type: 'sqlite',
            database: ':memory:',
            entities: [User],
            synchronize: true,
            dropSchema: true,
          }
        : {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            entities: [User],
            synchronize: true,
          },
    ),
  ],
})
export class AppModule {}
