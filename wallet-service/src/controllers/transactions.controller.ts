import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import knex from "../db/knex";

class TransactionsController {
    async get(request: Request, response: Response) {
        const transactions = await knex.select().from('transactions');
        return response.send(transactions);
    };

    async create(request: Request, response: Response) {
        try {
            const transaction = await knex('transactions').insert({ id: uuidv4(), ...request.body });
            return response.send(transaction);
        } catch (error) {
            console.log(error);
            return response.status(500).send();
        }
    };

    async balance(request: Request, response: Response) {
        return response.send();
    }
}

export default TransactionsController;