import { TransformPlainToClass } from "@nestjs/class-transformer";
import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { UserLoginResponseSchema } from "./schemas/user-login-response.schema";
import { UserLoginSchema } from "./schemas/user-login.schema";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("")
  @TransformPlainToClass(UserLoginResponseSchema)
  async login(
    @Body() userLogin: UserLoginSchema
  ): Promise<UserLoginResponseSchema> {
    return this.authService.login(userLogin);
  }
}
