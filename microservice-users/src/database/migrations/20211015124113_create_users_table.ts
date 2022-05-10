import { Knex } from "knex";
import { USERS_TABLE } from "../../constants";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    USERS_TABLE,
    (table: Knex.CreateTableBuilder) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.text("first_name").notNullable();
      table.text("last_name").notNullable();
      table.text("password").notNullable();
      table.text("email").notNullable();
    }
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(USERS_TABLE);
}
