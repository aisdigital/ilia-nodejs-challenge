import { TransactionType } from '@prisma/client';
import {
  ListTransactionQuerySchemaType,
  TransactionSchemaType,
} from '../types/wallet';
import { walletDB } from '../utils/db';

export const createTransaction = async (transaction: TransactionSchemaType) => {
  const createTransaction = await walletDB.transaction.create({
    data: transaction,
    select: {
      amount: true,
      id: true,
      user_id: true,
      type: true,
    },
  });

  return createTransaction;
};

export const getTransactions = async (
  params: ListTransactionQuerySchemaType
) => {
  const typeQueryParam = params.type
    ? { type: params.type as TransactionType }
    : {};

  const transactions = await walletDB.transaction.findMany({
    where: {
      user_id: params.user_id,
      ...typeQueryParam,
    },
  });

  return transactions;
};

export const getBalance = async (user_id: string) => {
  const balance = await walletDB.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      user_id,
    },
  });

  return balance._sum.amount;
};
