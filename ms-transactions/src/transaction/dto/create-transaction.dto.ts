export class CreateTransactionDto {
  user_id: string;
  amount: bigint;
  type: Operation;
}

export enum Operation {
  'CREDIT',
  'DEBIT',
}
