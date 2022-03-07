enum TransactionType {
  CREDIT,
  DEBIT,
}

export default interface ICreateTransactionDTO {
  user_id: string;
  amount: number;
  type: TransactionType;
}
