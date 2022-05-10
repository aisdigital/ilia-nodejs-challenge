import { CustomDecorator, SetMetadata } from "@nestjs/common";

const IS_PUBLIC = "isPublic";

const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC, true);

export { IS_PUBLIC, Public };
