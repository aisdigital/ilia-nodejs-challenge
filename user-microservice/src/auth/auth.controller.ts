import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsPublic } from './decorators/isPublic.decorator';
import { LocalAuthGuard } from './guards/localAuth.guard';
import { AuthRequest } from './models/AuthRequest';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('auth')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  authenticate(@Request() req: AuthRequest) {
    return this.authService.authenticate(req.user);
  }
}
