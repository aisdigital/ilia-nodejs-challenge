import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    UserModule,
  ],
})
export class AppModule {}
