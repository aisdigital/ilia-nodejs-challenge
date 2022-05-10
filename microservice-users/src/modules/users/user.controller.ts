import { TransformPlainToClass } from "@nestjs/class-transformer";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { UserEntity } from "./entities/user.entity";
import { IdSchema } from "./schemas/id-schema";
import { UserInputSchema } from "./schemas/user-input.schema";
import { UserListQuerySchema } from "./schemas/user-list-query.schema";
import { UserResponseSchema } from "./schemas/user-response.schema";
import { UserUpdateSchema } from "./schemas/user-update.schema";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Post("")
  @TransformPlainToClass(UserResponseSchema)
  async createUser(@Body() user: UserInputSchema): Promise<UserEntity> {
    return this.userService.create(user);
  }

  @Patch("/:id")
  @TransformPlainToClass(UserResponseSchema)
  updateUser(
    @Param() idSchema: IdSchema,
    @Body() body: UserUpdateSchema
  ): Promise<UserEntity> {
    return this.userService.update(idSchema.id, body);
  }

  @Get("/:id")
  @TransformPlainToClass(UserResponseSchema)
  findUser(@Param() idSchema: IdSchema): Promise<UserEntity | undefined> {
    return this.userService.findOneOrFail(idSchema.id);
  }

  @Get("")
  @TransformPlainToClass(UserResponseSchema)
  findusers(
    @Query() userListQuerySchema: UserListQuerySchema
  ): Promise<UserEntity[]> {
    return this.userService.find(userListQuerySchema);
  }

  @Delete("/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUser(@Param() idSchema: IdSchema): Promise<void> {
    return this.userService.remove(idSchema.id);
  }
}
