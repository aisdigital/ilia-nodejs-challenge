import { Controller, Post, Body } from '@nestjs/common';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user.use-case';
import { AuthRequestDto } from '../dtos/auth-request.dto';
import { UserMapper } from '../mappers/user.mapper';
import { JwtService, AuthResponse } from '../../infrastructure/auth/jwt.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async login(@Body() requestDto: AuthRequestDto): Promise<AuthResponse> {
    const authDto = UserMapper.toAuthDto(requestDto);
    const user = await this.authenticateUserUseCase.execute(authDto);
    return this.jwtService.generateToken(user);
  }
}
