import { EnvService } from '@config/env/env.service';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { TransactionCreatedDto } from './dto/TransactionCreated.dto';
@Injectable()
export class TransactionService {
  constructor(
    private readonly envService: EnvService,
    private readonly httpService: HttpService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    accessToken: string,
  ): Promise<TransactionCreatedDto> {
    const URL = `${this.envService.transactionMSApi}/create-transaction`;
    const body = { createTransactionDto };
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
      Logger.error(error.response.data, 'error');
      throw new HttpException(error.response.data, error.response.status);
    }
  }
}
