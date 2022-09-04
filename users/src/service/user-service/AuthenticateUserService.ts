import { IUserRepository } from "@repositories/user-repository/IUserRepository";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

export class AuthenticateUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Incorrect email or password.");
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Incorrect email or password.");
    }

    const token = sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET_TOKEN_USERS,
      {
        subject: user.id,
        expiresIn: "15m",
      }
    );

    return token;
  }
}
