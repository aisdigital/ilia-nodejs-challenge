import { Logger } from 'winston';
import {
  Controller,
  Post,
  Body,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IAuthParams } from './interfaces/auth.interface';

const UNAUTHORIZED_DEFAULT_MESSAGE = 'Invalid Credentials';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Post('token')
  @ApiConsumes('application/json')
  @ApiOkResponse({ description: 'Return a accessToken', isArray: false })
  @ApiServiceUnavailableResponse({
    description: 'Login Error',
    isArray: false,
  })
  @ApiResponse({ status: 401, description: UNAUTHORIZED_DEFAULT_MESSAGE })
  async generateToken(@Body() payload: IAuthParams) {
    if (payload.username && payload.password) {
      this.logger.info(`Trying generate token to user %j`, payload);
      return await this.authService.generateToken(payload);
    } else {
      this.logger.error('Missing data to proceed token generation');
      throw new UnauthorizedException({
        mensagem: 'Insufficient data for token generation',
      });
    }
  }
}
