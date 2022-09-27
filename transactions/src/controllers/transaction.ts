import { Request, Response} from 'express';
import transaction from '../database/models/transaction';

export default {
    
    async createTransaction(req: Request, res: Response) {
        const transactionParams = {
            userId: req.body.userId,
            type: req.body.type,
            amount: req.body.amount
        }
        let verify = (req.body.userId && (req.body.type == 'CREDIT' || req.body.type == 'DEBIT') && req.body.amount);
        console.log(verify)
        if (!verify) {
            return res.status(400).json('bad request');
        }
        const responseQuery = await transaction.createTransaction(transactionParams);
        console.log(responseQuery);
        if (responseQuery) {
            return res.status(200).json('Transação realizada com sucesso');
        }
        return res.status(400).json('bad request');

    },

    async getTransactions(req: Request, res: Response) {

        const transactionGet = {
            userId: Number(req.params.id)
        }

        let verify = req.params.id

        if(!verify) {
            return res.status(400).json('bad request');
        }
        const responseQuery = await transaction.getTransactions(transactionGet);
        if (responseQuery) {
            return res.status(200).json(responseQuery);
        }
        return res.status(400).json('bad request');
    }

}