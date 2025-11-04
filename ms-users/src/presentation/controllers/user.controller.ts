import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { GetAllUsersUseCase } from '../../application/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import { UpdateUserRequestDto } from '../dtos/update-user-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  async createUser(
    @Body() requestDto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    const createDto = UserMapper.toCreateUserDto(requestDto);
    const user = await this.createUserUseCase.execute(createDto);
    return UserMapper.toUserResponse(user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.getAllUsersUseCase.execute();
    return users.map(user => UserMapper.toUserResponse(user));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.getUserByIdUseCase.execute(id);
    return UserMapper.toUserResponse(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() requestDto: UpdateUserRequestDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    if (req.user.userId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const updateDto = UserMapper.toUpdateUserDto(requestDto);
    const user = await this.updateUserUseCase.execute(id, updateDto);
    return UserMapper.toUserResponse(user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string, @Request() req): Promise<void> {
    if (req.user.userId !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.deleteUserUseCase.execute(id);
  }
}
