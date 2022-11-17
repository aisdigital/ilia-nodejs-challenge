import { Module } from '@nestjs/common';

import { EnvModule } from '@config/env/env.module';
import { PrismaService } from '@shared/prisma/prisma.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { KafkaModule } from '@shared/kafka/kafka.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, KafkaModule, EnvModule, UserModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
