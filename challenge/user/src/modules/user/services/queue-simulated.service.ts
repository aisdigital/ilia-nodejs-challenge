import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity'; // Assuming you have a Wallet entity
import axios from 'axios';
@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet)
        private readonly repository: Repository<Wallet>,
    ) { }

    async deposit(id: number, { balance }: { balance: number }): Promise<Wallet> {
        const wallet = await this.repository.findOne(id);

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }
        try {
            const externalApiResponse = await axios.post(`https://localhost:3002/api/wallets/${id}/deposit`, {
                amount: balance,
            });
            const updatedWallet: Wallet = externalApiResponse.data;
            wallet.balance = updatedWallet.balance;
            await this.repository.save(wallet);

            return wallet;
        } catch (error) {
            throw new Error(`Failed to deposit: ${error.message}`);
        }
    }


    async withdraw(id: number, { amount }: { amount: number }): Promise<Wallet> {
        const wallet = await this.repository.findOne(id);

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        if (wallet.balance < amount) {
            throw new NotFoundException('Insufficient funds');
        }
        try {
            const externalApiResponse = await axios.post(`https://localhost:3002/api/wallets/${id}/withdraw`, {
                walletId: id,
                withdrawalAmount: amount,
            });
            const updatedWallet: Wallet = externalApiResponse.data;
            wallet.balance = updatedWallet.balance;
            await this.repository.save(wallet);

            return wallet;
        } catch (error) {
            throw new Error(`Failed to withdraw: ${error.message}`);
        }
    }


}
