/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NextFunction, Request, Response } from 'express';
import { isEmpty } from 'lodash';
import ErrorHandler from '../../utils/error';
import { TokenData } from '../../utils/passport-helper';
import TransactionModel from './models/Transaction';

type Req = Request & {
  user: TokenData;
};

export const createTransaction = async (req: Req, res: Response, next: NextFunction) => {
  try {
    const transaction = new TransactionModel({
      user_id: req.body.user_id,
      amount: req.body.amount,
      type: req.body.type,
    });

    await transaction.save();

    return res.status(201).json(transaction.serialize()).end();
  } catch (error) {
    if (error instanceof ErrorHandler) {
      next(error);
    } else {
      next(new ErrorHandler(500, error.message));
    }
  }
};

export const listTransactions = async (req: Req, res: Response, next: NextFunction) => {
  try {
    let findOptions = {};

    if (req.query.type) {
      findOptions = Object.assign(findOptions, { type: req.query.type });
    }

    if (req.query.user_id) {
      findOptions = Object.assign(findOptions, { user_id: req.query.user_id });
    }

    const transactions = await TransactionModel.find(findOptions);

    return res.status(200).json(transactions.map((transaction) => transaction.serialize()));
  } catch (error) {
    if (error instanceof ErrorHandler) {
      next(error);
    } else {
      next(new ErrorHandler(500, error?.response?.data));
    }
  }
};

export const getBalace = async (req: Req, res: Response, next: NextFunction) => {
  try {
    const balance = await TransactionModel.aggregate([
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: null,
          types: {
            $push: {
              k: '$_id',
              v: { amount: '$amount' },
            },
          },
        },
      },
      {
        $replaceWith: {
          $arrayToObject: '$types',
        },
      },
      {
        $project: {
          credit: { amount: '$CREDIT.amount' },
          debit: { amount: '$DEBIT.amount' },
          all: { amount: { $sum: ['$CREDIT.amount', '$DEBIT.amount'] } },
        },
      },
    ]);

    return res.status(200).json(balance[0]);
  } catch (error) {
    if (error instanceof ErrorHandler) {
      next(error);
    } else {
      next(new ErrorHandler(500, error?.response?.data));
    }
  }
};
