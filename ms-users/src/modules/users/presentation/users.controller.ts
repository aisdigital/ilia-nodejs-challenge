import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CreateUserDto } from '../application/dtos/create-user.dto';
import { UpdateUserDto } from '../application/dtos/update-user.dto';

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() body: CreateUserDto) {
    return {
      message: 'User creation endpoint scaffolded',
      data: body,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list() {
    return [];
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  detail(@Param('id') id: string) {
    return {
      id,
      message: 'User detail endpoint scaffolded',
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return {
      id,
      ...body,
      message: 'User update endpoint scaffolded',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return {
      id,
      message: 'User delete endpoint scaffolded',
    };
  }
}
