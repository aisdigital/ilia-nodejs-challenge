import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/localAuth.guard';

@Controller()
export class AuthController {
  @Post('auth')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  authenticate() {}
}
