import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { IsPublic } from 'src/shared/decorators/isPublic';
import { CreateUserDto } from 'src/shared/dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @IsPublic()
  signIn(@Body() authDto: AuthDto) {
    return this.authService.signIn(authDto);
  }

  @Post('signup')
  @IsPublic()
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }
}
