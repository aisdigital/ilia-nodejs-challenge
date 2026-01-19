import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { UserRequestDTO } from './dto/userRequest.dto';
import { UserService } from './users.service';

@Controller('/users')
@UseGuards(AuthenticationGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  async createUser(@Body() body: UserRequestDTO) {
    return await this.userService.create(body);
  }

  @Get()
  @HttpCode(200)
  async getUsers() {
    return await this.userService.getAll();
  }

  @Get('/:id')
  async getUserById(@Param('id') id: number) {
    return await this.userService.getOne(id);
  }

  @Patch('/:id')
  async updateUser(@Param('id') id: number, @Body() body: UserRequestDTO) {
    return await this.userService.update(id, body);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: number) {
    return await this.userService.delete(id);
  }
}
