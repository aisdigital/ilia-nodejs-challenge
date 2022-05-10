import { Knex } from "knex";
import { USERS_TABLE } from "../../constants";
import { UserEntity } from "../../modules/users/entities/user.entity";

export async function seed(knex: Knex): Promise<void> {
  await knex(USERS_TABLE).del();

  await knex<UserEntity>(USERS_TABLE).insert([
    {
      id: "4d13575f-64a1-4fd4-b96b-19a6e354388a",
      first_name: "Gabriel",
      last_name: "Salla",
      password: "Desafio@123",
      email: "gabrielsalla@outlook.com",
    },
  ]);
}
