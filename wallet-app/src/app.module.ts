import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule as AppModuleV1 } from './v1/app.module';
import { ConfigModule as ConfigOptionsModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { AppController } from './app.controller';
import { WinstonLoggerModule } from './shared/logger/winston-logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    WinstonLoggerModule,
    MongooseModule.forRootAsync({
      imports: [ConfigOptionsModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getMongoConfig().uri,
        useNewUrlParser: true,
        autoCreate: true,
        autoIndex: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),

    AppModuleV1,
  ],
  controllers: [AppController],
  providers: [Logger],
  exports: [],
})
export class AppModule {}
