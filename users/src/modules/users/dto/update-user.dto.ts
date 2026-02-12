import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../../shared/dtos/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
