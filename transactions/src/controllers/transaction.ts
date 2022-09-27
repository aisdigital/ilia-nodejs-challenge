import { Request, Response} from 'express';
import Transaction from '../database/models/transaction';

export default {
    async userCreate(req: Request, res: Response) {
        const user = {
            firstName: 'user',
            lastName: 'user',
            email: 'user@user.com'
        }
        const responseQuery = await Transaction.userCreate(user);
        console.log(responseQuery);
        res.send('ok');
    },
    
    async createBalance(req: Request, res: Response) {
        const transaction = {
            userId: 1,
            type: 'DEBIT',
            amount: 1234
        }
        const responseQuery = await Transaction.CreateBalance(transaction);
        console.log(responseQuery);
        res.send(responseQuery);
    },

    async getBalance(req: Request, res: Response) {
        const transactionGet = {
            userId: 1
        }
        const responseQuery = await Transaction.getBalance(transactionGet);
        console.log(responseQuery);
        res.send(responseQuery);
    },

    async getTransactions(req: Request, res: Response) {
        const transactionGet = {
            userId: 1
        }
        const responseQuery = await Transaction.getTransactions(transactionGet);
        console.log(responseQuery);
        res.send(responseQuery);
    },

};