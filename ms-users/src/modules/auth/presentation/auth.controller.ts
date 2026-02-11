import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from '../application/dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post()
  authenticate(@Body() body: AuthDto) {
    const accessToken = this.jwtService.sign({
      sub: 'scaffold-user-id',
      email: body.email,
    });

    return {
      user: {
        id: 'scaffold-user-id',
        first_name: 'Scaffold',
        last_name: 'User',
        email: body.email,
      },
      access_token: accessToken,
    };
  }
}
