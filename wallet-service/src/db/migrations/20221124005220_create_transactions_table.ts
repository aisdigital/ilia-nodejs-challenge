import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('transactions', (table: Knex.TableBuilder) => {
        table.string('id').primary();
        table.string('user_id').notNullable();
        table.foreign('user_id').references('id').inTable('users');
        table.integer('amount').notNullable();
        table.enu('type', ['CREDIT', 'DEBIT']);
        table.timestamps();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('transactions');
}

