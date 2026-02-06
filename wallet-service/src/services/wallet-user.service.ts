import { WalletUserRepository } from '../repositories/wallet-user.repository';
import { CreateWalletUserInput } from '../schemas/wallet-user.schema';

interface WalletUserResponse {
  id: string;
  externalUserId: string;
  createdAt: Date;
  isNew: boolean;
}

export class WalletUserService {
  private repository: WalletUserRepository;

  constructor() {
    this.repository = new WalletUserRepository();
  }

  async ensureWalletUserExists(data: CreateWalletUserInput): Promise<WalletUserResponse> {
    const { user_id } = data;

    const existingUser = await this.repository.findByExternalUserId(user_id);

    if (existingUser) {
      return {
        id: existingUser.id,
        externalUserId: existingUser.externalUserId,
        createdAt: existingUser.createdAt,
        isNew: false,
      };
    }

    const newUser = await this.repository.create({
      externalUserId: user_id,
    });

    return {
      id: newUser.id,
      externalUserId: newUser.externalUserId,
      createdAt: newUser.createdAt,
      isNew: true,
    };
  }
}
