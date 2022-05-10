import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { UserEntity } from "./entities/user.entity";
import { UserInputSchema } from "./schemas/user-input.schema";
import { UserListQuerySchema } from "./schemas/user-list-query.schema";
import { UserFilter } from "./types/user-filter.type";
import { UserInputType } from "./types/user-input.type";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UserRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  async create(userInputSchema: UserInputSchema): Promise<UserEntity> {
    this.logger.info("Creating new user");

    const userInputType: UserInputType = {
      id: userInputSchema.id ? userInputSchema.id : undefined,
      first_name: userInputSchema.first_name,
      last_name: userInputSchema.last_name,
      password: userInputSchema.password,
      email: userInputSchema.email,
    };

    return this.usersRepository.save(userInputType);
  }

  async findOne(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne(id);
  }

  async findOneOrFail(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      this.logger.warn("UserEntity not found");
      throw new NotFoundException("UserEntity not found");
    }

    return user;
  }

  find(params: UserListQuerySchema): Promise<UserEntity[]> {
    const filters: UserFilter = params;

    this.logger.info("Finding users");

    return this.usersRepository.find(filters);
  }

  async update(id: string, attrs: Partial<UserEntity>): Promise<UserEntity> {
    await this.findOneOrFail(id);
    return this.usersRepository.update({
      ...attrs,
      id,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOneOrFail(id);

    await this.usersRepository.delete(id);
  }
}
