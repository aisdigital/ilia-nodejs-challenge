import { Request, Response } from 'express';
import { WalletUserService } from '../services/wallet-user.service';
import { CreateWalletUserInput } from '../schemas/wallet-user.schema';

export class WalletUserController {
  private service: WalletUserService;

  constructor() {
    this.service = new WalletUserService();
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = req.body as CreateWalletUserInput;
      const result = await this.service.ensureWalletUserExists(validatedData);

      const statusCode = result.isNew ? 201 : 200;
      res.status(statusCode).json({
        id: result.id,
        external_user_id: result.externalUserId,
        created_at: result.createdAt,
      });
    } catch (error) {
      console.error('Error creating wallet user:', error);
      res.status(500).json({ error: 'Failed to create wallet user' });
    }
  }
}
