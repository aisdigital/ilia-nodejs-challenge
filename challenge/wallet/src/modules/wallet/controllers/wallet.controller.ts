import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BadRequest } from 'src/http/default-body/bad-request';
import { NotFound } from 'src/http/default-body/not-found';
import { Wallet } from '../entities/wallet.entity';
import { DepositWithdrawalDto } from '../dtos/deposit-withdrawal';
import { WalletService } from '../services/wallet.service';

@ApiTags('Wallet')
@Controller('api/wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'List wallets' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of wallets successfully loaded',
    type: Wallet,
    isArray: true,
  })
  async index(): Promise<Wallet[]> {
    return this.walletService.getAllWallets();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Wallet successfully created',
    type: Wallet,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payload body',
    type: BadRequest,
  })
  async store(@Body() body: { balance: number }): Promise<Wallet> {
    return this.walletService.createWallet(body.balance);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Deposit funds to a wallet' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funds deposited successfully',
    type: Wallet,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payload body',
    type: BadRequest,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wallet not found',
    type: NotFound,
  })
  async deposit(@Param('id') id: number, @Body() body: DepositWithdrawalDto): Promise<Wallet> {
    return this.walletService.depositFunds(id, body.amount);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw funds from a wallet' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funds withdrawn successfully',
    type: Wallet,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payload body',
    type: BadRequest,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wallet not found',
    type: NotFound,
  })
  async withdraw(@Param('id') id: number, @Body() body: DepositWithdrawalDto): Promise<Wallet> {
    return this.walletService.withdrawFunds(id, body.amount);
  }
}
