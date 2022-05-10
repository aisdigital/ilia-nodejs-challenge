import { Exclude, Expose } from "@nestjs/class-transformer";
import { LoginInputSchema } from "./login-input.schema";

@Exclude()
export class UserLoginSchema {
  @Expose()
  user: LoginInputSchema;
}
