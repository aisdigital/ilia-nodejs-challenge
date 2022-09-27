import { Request, Response} from 'express';
import balance from '../database/models/balance';

export default {
    async getBalance(req: Request, res: Response) {
        const transactionGet = {
            userId: Number(req.params.id)
        }

        let verify = req.params.id
        if(!verify) {
            res.send(400).json('bad request');
        }
        const responseQuery = await balance.getBalance(transactionGet);
        console.log(responseQuery);
        res.send(responseQuery);
    }
};