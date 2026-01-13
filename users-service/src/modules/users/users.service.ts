import bcrypt from "bcrypt";
import { UsersRepository } from "./users.repository.js";
import { CreateUserDTO } from "./dto/create-user.dto.js";
import { LoginDTO } from "./dto/login.dto.js";
import { User } from "./entities/user.entity.js";
import { randomUUID } from "crypto";
import { publishUserCreated } from "../../kafka/user.producer.js";

export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly jwt: any
  ) {}

  async createUser(dto: CreateUserDTO): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = new User(
      randomUUID(),
      dto.first_name,
      dto.last_name,
      dto.email,
      passwordHash,
      new Date()
    );

    await this.repository.create(user);

    await publishUserCreated(user.id, user.email);

    return user;
  }

  async login(dto: LoginDTO): Promise<string> {
    const user = await this.repository.findByEmail(dto.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    return this.jwt.sign({
      sub: user.id,
      email: user.email,
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }
}
