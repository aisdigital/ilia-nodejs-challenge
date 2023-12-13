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
  const transactions = await walletDB.transaction.findMany({
    where: {
      user_id: params.user_id,
      type: params.type,
    },
  });

  return transactions;
};
