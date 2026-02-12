import { Controller, Get, Body, Patch, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@ActiveUserId() userId: string) {
    return this.usersService.findUnique(userId);
  }

  @Get()
  list() {
    return this.usersService.findAll();
  }

  @Get(':id')
  listUserById(@Param('id') userId: string) {
    return this.usersService.findUnique(userId);
  }

  @Patch(':id')
  update(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') userId: string) {
    return this.usersService.remove(userId);
  }
}
