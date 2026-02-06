export interface WalletUser {
  id: string;
  externalUserId: string;
  createdAt: Date;
}

export interface CreateWalletUserRequest {
  externalUserId: string;
}
