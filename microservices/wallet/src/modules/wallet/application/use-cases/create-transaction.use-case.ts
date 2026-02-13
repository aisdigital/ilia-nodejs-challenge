/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import * as IWalletRepository from '../../domain/repositories/IWalletRepository';
import {
  Transaction,
  TransactionType,
} from '../../domain/entities/Transaction';
import { Left, Right, Either, isLeft } from '../../../../shared/either/Either';
import { IUsersService } from '../../../users/ports/users.service.interface';

export class InvalidAmountError extends Error {}
export class InsufficientBalanceError extends Error {
  constructor(available: number, required: number) {
    super(
      `Insufficient balance. Available: ${available}, Required: ${required}`,
    );
    this.name = 'InsufficientBalanceError';
  }
}
export class UserNotFoundError extends Error {}

type CreateTransactionError =
  | InvalidAmountError
  | InsufficientBalanceError
  | UserNotFoundError
  | Error;
type CreateTransactionResult = Either<CreateTransactionError, Transaction>;

export interface CreateTransactionCommand {
  userId: string;
  amount: number;
  type: TransactionType;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    private readonly walletRepository: IWalletRepository.IWalletRepository,
    private readonly usersService: IUsersService,
  ) {}

  public async execute(
    command: CreateTransactionCommand,
  ): Promise<CreateTransactionResult> {
    const { userId, amount, type } = command;

    const transactionOrError = Transaction.create({ userId, amount, type });
    if (transactionOrError instanceof Error) {
      return Left(new InvalidAmountError(transactionOrError.message));
    }
    const transaction = transactionOrError;

    const userExists = await this.usersService.checkUserExists(userId);
    if (isLeft(userExists)) {
      return Left(new UserNotFoundError(userExists.left.message));
    }

    if (type === TransactionType.DEBIT) {
      const balance = await this.walletRepository.getBalanceByUserId(userId);
      if (balance.amount < amount) {
        return Left(new InsufficientBalanceError(balance.amount, amount));
      }
    }
    await this.walletRepository.save(transaction);
    return Right(transaction);
  }
}
