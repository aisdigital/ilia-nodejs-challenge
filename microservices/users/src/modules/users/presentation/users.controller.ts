/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Post,
  HttpCode,
  ConflictException,
  UnauthorizedException,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import {
  RegisterUser,
  RegisterUserInput,
} from '../application/use-cases/RegisterUser';
import { LoginUser } from '../application/use-cases/LoginUser';
import {
  RegisterUserDto,
  LoginUserDto,
  AuthResponseDto,
  UserResponseDto,
} from './dtos/user.dto';
import { IUserRepository } from '../domain/repository/IUserRepository';
import { JwtAuthGuard } from '../infra/auth/jwt-auth.guard';

@Controller()
export class UsersController {
  constructor(
    private readonly registerUserUseCase: RegisterUser,
    private readonly loginUserUseCase: LoginUser,
    private readonly userRepository: IUserRepository,
  ) {}

  @Post('users')
  async register(@Body() dto: RegisterUserDto): Promise<AuthResponseDto> {
    try {
      const input: RegisterUserInput = {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: dto.password,
      };

      const result = await this.registerUserUseCase.execute(input);

      return {
        user: result.user,
        access_token: result.token.accessToken,
      };
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new ConflictException(e.message);
      }
      throw e;
    }
  }

  @Post('auth')
  @HttpCode(200)
  async login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    try {
      const result = await this.loginUserUseCase.execute(dto);

      return {
        user: result.user,
        access_token: result.token.accessToken,
      };
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw new UnauthorizedException(e.message);
      }
      throw e;
    }
  }

  // ----------------------------------------------------
  // ROTAS DE USUÁRIO (Protegidas)
  // ----------------------------------------------------

  // GET /users/me (Exemplo de rota protegida)
  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any): Promise<UserResponseDto> {
    const userId = req.user.userId; // ID do usuário extraído do JWT

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found or token invalid.');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
