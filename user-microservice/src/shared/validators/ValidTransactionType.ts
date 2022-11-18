import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'validateStoneCode', async: false })
export class ValidTransactionType implements ValidatorConstraintInterface {
  validate(transactionType: string): boolean {
    if (typeof transactionType === 'string') {
      if (transactionType !== 'DEBIT' || 'CREDIT') {
        return true;
      }
      return false;
    }
  }

  defaultMessage(): string {
    const message = 'Transaction tYpe must be CREDIT or DEBIT';
    return message;
  }
}
