import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { plainToClass } from "class-transformer";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { UserService } from "../users/user.service";
import { UserLoginResponseSchema } from "./schemas/user-login-response.schema";
import { UserLoginSchema } from "./schemas/user-login.schema";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  async login(userLogin: UserLoginSchema): Promise<UserLoginResponseSchema> {
    const [userFinded] = await this.usersService.find({
      email: userLogin.user.email,
    });

    if (!userFinded) {
      throw new UnauthorizedException();
    }

    if (userLogin.user.password !== userFinded.password) {
      throw new UnauthorizedException();
    }

    const payload = { email: userLogin.user.email, sub: userFinded.id };
    const accessToken = this.jwtService.sign(payload);

    return plainToClass(UserLoginResponseSchema, {
      user: userFinded,
      access_token: accessToken,
    });
  }
}
