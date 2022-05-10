import { DynamicModule, Module } from "@nestjs/common";
import { Knex, knex } from "knex";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

export const KNEX_MODULE = "KNEX_MODULE";

@Module({})
export class KnexModule {
  static forRoot(token: string, options: Knex.Config): DynamicModule {
    return {
      global: true,
      module: KnexModule,
      providers: [
        {
          inject: [WINSTON_MODULE_PROVIDER],
          provide: token,
          useFactory: (logger: Logger) => {
            logger.info("Creating new knex instance", {
              context: KnexModule.name,
              tags: ["instance", "knex", "create"],
            });
            return knex(options);
          },
        },
      ],
      exports: [token],
    };
  }
}
