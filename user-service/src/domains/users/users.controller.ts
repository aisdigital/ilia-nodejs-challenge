import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
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
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  @Patch('/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UserRequestDTO,
  ) {
    return await this.userService.update(id, body);
  }

  @Delete('/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.delete(id);
  }
}
