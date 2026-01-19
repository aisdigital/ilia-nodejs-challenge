import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseDTO } from './dto/authResponse.dto';
import { AuthDTO } from './dto/auth.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(200)
  async login(@Body() dto: AuthDTO): Promise<AuthResponseDTO> {
    return await this.authService.login(dto);
  }
}
