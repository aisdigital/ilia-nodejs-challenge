import { Request, Response} from 'express';
import balance from '../database/models/balance';

export default {
    async getBalance(req: Request, res: Response) {
        const transactionGet = {
            userId: Number(req.params.id)
        }

        let verify = req.params.id
        if(!verify) {
            res.status(400).json('bad request');
        }
        const responseQuery: any = await balance.getBalance(transactionGet);
        console.log(responseQuery[0]);
        let response = {
            userId: req.params.id,
            balance: responseQuery[0].balance
        }
        res.status(200).json(response);
    }
};