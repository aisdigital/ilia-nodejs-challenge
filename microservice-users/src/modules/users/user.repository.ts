import { Inject, Injectable } from "@nestjs/common";
import { Knex } from "knex";
import { KNEX_TOKEN, USERS_TABLE } from "../../constants";
import { UserEntity } from "./entities/user.entity";
import { UserUpdateSchema } from "./schemas/user-update.schema";
import { UserFilter } from "./types/user-filter.type";
import { UserInputType } from "./types/user-input.type";

@Injectable()
export class UserRepository {
  // eslint-disable-next-line no-useless-constructor
  constructor(@Inject(KNEX_TOKEN) private readonly knex: Knex) {}

  async exists(filter: UserFilter): Promise<boolean> {
    const query = this.knex<UserEntity>(USERS_TABLE).column(
      this.knex.raw("1 as exists")
    );

    if (filter.id) {
      query.where({ id: filter.id });
    }

    const tenant = await query.first<UserEntity>();

    return !!tenant;
  }

  async find(filter: UserFilter): Promise<UserEntity[]> {
    const query = this.knex<UserEntity>(USERS_TABLE);

    if (filter.id) {
      query.where({ id: filter.id });
    }

    if (filter.first_name) {
      query.where({ first_name: filter.first_name });
    }

    if (filter.last_name) {
      query.where({ last_name: filter.last_name });
    }

    if (filter.email) {
      query.where({ email: filter.email });
    }

    return query;
  }

  async findOne(id: string): Promise<UserEntity | null> {
    const query = this.knex<UserEntity>(USERS_TABLE)
      .select<UserEntity>()
      .where({ id });

    return query.first<UserEntity>();
  }

  async save(values: UserInputType): Promise<UserEntity> {
    const [user] = await this.knex<UserEntity>(USERS_TABLE)
      .insert({
        ...values,
      })
      .returning("*");

    return user;
  }

  async update(values: UserUpdateSchema): Promise<UserEntity> {
    const [user] = await this.knex<UserEntity>(USERS_TABLE)
      .update({
        ...values,
      })
      .where({
        id: values.id,
      })
      .returning("*");

    return user;
  }

  async delete(id: string): Promise<void> {
    await this.knex<UserEntity>(USERS_TABLE).delete().where({ id });
  }
}
