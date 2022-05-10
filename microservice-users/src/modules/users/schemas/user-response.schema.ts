import { Exclude, Expose } from "@nestjs/class-transformer";

@Exclude()
export class UserResponseSchema {
  @Expose()
  id: string;

  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @Expose()
  email: string;
}
