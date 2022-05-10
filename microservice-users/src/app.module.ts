import { Module, ValidationPipe } from "@nestjs/common";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { WinstonModule } from "nest-winston";
import winstonConfig from "./config/winston/winston.config";
import { KNEX_TOKEN } from "./constants";
import knexConfig from "./database/knexfile";
import { AuthModule } from "./modules/auth/auth.module";
import { JwtGuard } from "./modules/auth/jwt.guard";
import { KnexModule } from "./modules/knex/knex.module";
import { UsersModule } from "./modules/users/user.module";

@Module({
  imports: [
    KnexModule.forRoot(KNEX_TOKEN, knexConfig),
    AuthModule,
    UsersModule,
    JwtModule.register({}),
    WinstonModule.forRoot(winstonConfig),
  ],
  controllers: [],
  providers: [
    { provide: APP_PIPE, useValue: new ValidationPipe({}) },
    { provide: APP_GUARD, useClass: JwtGuard },
  ],
})
export class AppModule {}
