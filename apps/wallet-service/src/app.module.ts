import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ClientsModule.register([
      {
        name: 'WALLET_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'wallet',
          protoPath: join(__dirname, '../../proto/wallet.proto'),
          url: process.env.GRPC_URL,
        },
      },
    ]),
    AuthModule,
    WalletModule,
  ],
})
export class AppModule {
  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      const requiredDbVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
      const missingDbVars = requiredDbVars.filter(varName => !process.env[varName]);
      
      if (missingDbVars.length > 0) {
        throw new Error(`Missing required database environment variables: ${missingDbVars.join(', ')}`);
      }
    }
  }
}
