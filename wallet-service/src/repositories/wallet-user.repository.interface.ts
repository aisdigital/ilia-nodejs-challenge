import { WalletUser, CreateWalletUserRequest } from '../types/wallet-user.types';

export interface IWalletUserRepository {
  create(request: CreateWalletUserRequest): Promise<WalletUser>;
  findById(id: string): Promise<WalletUser | null>;
  findByExternalUserId(externalUserId: string): Promise<WalletUser | null>;
  delete(id: string): Promise<void>;
  exists(externalUserId: string): Promise<boolean>;
}
