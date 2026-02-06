import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { AuthenticatedRequest } from '../middleware/authenticate';

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = req.body as RegisterInput;
      const result = await this.service.register(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({ error: 'Email already registered' });
      } else {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = req.body as LoginInput;
      const result = await this.service.login(validatedData);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email or password') {
        res.status(401).json({ error: 'Invalid email or password' });
      } else {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to login' });
      }
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const correlationId = req.headers['x-correlation-id'] as string;
      const user = await this.service.getUserWithBalance(userId, correlationId);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: 'User not found' });
      } else {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
      }
    }
  }

  async createTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const correlationId = req.headers['x-correlation-id'] as string;
      const transaction = await this.service.createTransaction(userId, req.body, correlationId);
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  async getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const correlationId = req.headers['x-correlation-id'] as string;
      const result = await this.service.getTransactions(userId, correlationId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  async getBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const correlationId = req.headers['x-correlation-id'] as string;
      const balance = await this.service.getBalance(userId, correlationId);
      res.status(200).json(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  }
}
