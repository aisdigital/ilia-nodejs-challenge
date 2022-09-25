import { Request, Response} from 'express';
import Transaction from '../database/repository/transaction';

export default {
    async create(req: Request, res: Response) {
        const user = {
            username: 'user'
        }
        const transaction = await Transaction.create(user);
        console.log(transaction);
        res.send('ok');
    },

    async list(req: Request, res: Response) {
        
    },

};