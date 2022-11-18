import { EnvService } from '@config/env/env.service';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { TransactionCreatedDto } from './dto/TransactionCreated.dto';
import { GetBalance } from './dto/getBalance.dto';
@Injectable()
export class TransactionService {
  constructor(
    private readonly envService: EnvService,
    private readonly httpService: HttpService,
  ) {}

  async create(
    transaction: CreateTransactionDto,
    accessToken: string,
  ): Promise<TransactionCreatedDto> {
    const { amount, type, userId } = transaction;
    const URL = `${this.envService.transactionMSApi}/transactions`;
    const body = { userId, type, amount };
    const headersReq = {
      Authorization: accessToken,
    };

    try {
      const res = await firstValueFrom(
        this.httpService.post<TransactionCreatedDto>(URL, body, {
          headers: headersReq,
        }),
      );

      return res.data;
    } catch (error) {
      Logger.error(error.response, 'error');
      throw new HttpException('error.response.data', 500);
    }
  }

  async getBalance(accessToken: string): Promise<GetBalance> {
    const URL = `${this.envService.transactionMSApi}/balance`;
    const headersReq = {
      Authorization: accessToken,
    };

    try {
      const res = await firstValueFrom(
        this.httpService.get<GetBalance>(URL, {
          headers: headersReq,
        }),
      );

      return res.data;
    } catch (error) {
      Logger.error(error.response.data, 'error');
      throw new HttpException('error.response.data', 500);
    }
  }
}
