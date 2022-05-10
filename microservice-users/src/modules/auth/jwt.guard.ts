import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { IS_PUBLIC } from "./decorators/public.decorator";

@Injectable()
export class JwtGuard implements CanActivate {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler: Function = context.getHandler();

    const isPublic: boolean = this.reflector.get<boolean, string>(
      IS_PUBLIC,
      handler
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token type must be bearer");
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException("Access token is missing or invalid");
    }

    const decodedToken = this.jwtService.decode(token);

    if (!decodedToken || typeof decodedToken === "string") {
      throw new UnauthorizedException("Decoded token is malformed");
    }

    this.logger.warn(`decodedToken ${JSON.stringify(decodedToken)}`);

    return true;
  }
}
