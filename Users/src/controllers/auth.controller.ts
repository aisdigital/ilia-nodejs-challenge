import { NextFunction, Request, Response } from 'express';
import AuthService from '@services/auth.service';
import { mapUser } from '@/mapper/User.mapper';
import { AuthUserDto } from '@/dtos/auth.dto';

class AuthController {
  public authService = new AuthService();

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: AuthUserDto = req.body;
      const { token, findUser } = await this.authService.login(userData);

      res.setHeader('Set-Cookie', [token]);
      res.status(200).json({ data: mapUser(findUser), access_token: token });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
