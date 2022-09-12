import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from 'src/shared/auth/auth.service';
import { Roles } from 'src/shared/roles/roles.decorators';
import { RolesGuard } from 'src/shared/roles/roles.guards';
import { ITransaction } from './interfaces/transactions.interfaces';
import { TransactionService } from './transactions.service';

@Controller('v1/transactions')
@ApiTags('Transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('')
  @UseGuards(RolesGuard)
  @Roles('read:transactions')
  async getAll() {
    const transactions = await this.transactionService.getAll();

    return transactions;
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('read:transactions')
  @ApiBearerAuth()
  async save(@Body() payload: ITransaction, @Req() req) {
    await this.transactionService.save(payload);

    return;
  }

  @Get('balance/:user_id')
  @UseGuards(RolesGuard)
  @Roles('read:transactions')
  async getRecursos(@Param() user_id) {
    const balance = await this.transactionService.getTransactionBalance(
      user_id,
    );
    return balance;
  }
}
