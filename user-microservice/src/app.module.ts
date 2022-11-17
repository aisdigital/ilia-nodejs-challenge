import { Module } from '@nestjs/common';

import { PrismaService } from '@shared/prisma/prisma.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { KafkaModule } from '@shared/kafka/kafka.module';

@Module({
  imports: [PrismaModule, KafkaModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
