import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const validUsers = [
      { username: 'admin', password: 'admin123', userId: 1 },
      { username: 'user', password: 'user123', userId: 2 },
    ];

    const user = validUsers.find(u => u.username === username && u.password === pass);
    
    if (user) {
      return { userId: user.userId, username: user.username };
    }
    
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
