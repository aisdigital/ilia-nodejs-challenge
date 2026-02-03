import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
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
}
