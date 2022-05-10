import { IsUUID } from "@nestjs/class-validator";

export class IdSchema {
  @IsUUID(4)
  id: string;
}
