import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

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
}
