import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvService } from './env.service';
import appConfig from './appConfig';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
