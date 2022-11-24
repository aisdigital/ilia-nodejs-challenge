import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
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
            const transaction = await knex('transactions').select().where({ id: request.body.id }).first();
            return response.send(transaction);
        } catch (error) {
            return response.status(500).send();
        }
    };

    async balance(request: Request, response: Response) {
        try {
            return response.send();
        } catch (error) {
            return response.status(500).send();
        }
    }
}

export default TransactionsController;