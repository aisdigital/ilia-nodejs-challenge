import { UserDto } from '../../application/dtos/user.dto';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { AuthDto } from '../../application/dtos/auth.dto';
import { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import { UpdateUserRequestDto } from '../dtos/update-user-request.dto';
import { AuthRequestDto } from '../dtos/auth-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

export class UserMapper {
  static toCreateUserDto(request: CreateUserRequestDto): CreateUserDto {
    const dto = new CreateUserDto();
    dto.firstName = request.first_name;
    dto.lastName = request.last_name;
    dto.email = request.email;
    dto.password = request.password;
    return dto;
  }

  static toUpdateUserDto(request: UpdateUserRequestDto): UpdateUserDto {
    const dto = new UpdateUserDto();
    dto.firstName = request.first_name;
    dto.lastName = request.last_name;
    dto.password = request.password;
    return dto;
  }

  static toAuthDto(request: AuthRequestDto): AuthDto {
    const dto = new AuthDto();
    dto.email = request.email;
    dto.password = request.password;
    return dto;
  }

  static toUserResponse(user: UserDto): UserResponseDto {
    return {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
    };
  }
}
