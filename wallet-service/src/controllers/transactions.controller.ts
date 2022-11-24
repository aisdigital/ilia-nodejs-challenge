import { Request, Response } from 'express';
import knex from "../db/knex";

class TransactionsController {
    async get(request: Request, response: Response) {
        try {
            const transactions = await knex.select().from('transactions');
            return response.send(transactions);
        } catch (error) {
            return response.status(500).send();
        }
    };

    async create(request: Request, response: Response) {
        try {
            await knex('transactions').insert(request.body);
            const transaction = await knex('transactions').select("id", "user_id", "amount", "type").where({ id: request.body.id }).first();
            return response.send(transaction);
        } catch (error) {
            return response.status(500).send();
        }
    };

    async balance(request: Request, response: Response) {
        try {
            const res = await knex.raw(`SELECT COALESCE((SELECT SUM(amount) FROM transactions WHERE type= 'DEBIT'), 0) - COALESCE((SELECT SUM(amount) FROM transactions WHERE type= 'CREDIT'), 0) AS amount;`);
            return response.send({ amount: res.rows[0].amount });
        } catch (error) {
            return response.status(500).send();
        }
    };
}

export default TransactionsController;