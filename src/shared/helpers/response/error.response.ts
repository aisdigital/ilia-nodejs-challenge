import { StatusCode } from "../../enums/status-code.enums";
import { IProps } from "../../interfaces/props.interface";

export abstract class ServiceError extends Error {
  public statusCode: StatusCode;
  public message: string;

  constructor(props: IProps) {
    super(props.message);
    Object.assign(this, props);
  }
}

export class NotFoundError extends ServiceError {
  constructor(message: string) {
    super({
      statusCode: StatusCode.NOT_FOUND,
      message,
    });
  }
}

export class BadRequestError extends ServiceError {
  constructor(message: string) {
    super({
      statusCode: StatusCode.BAD_REQUEST,
      message,
    });
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string) {
    super({
      statusCode: StatusCode.CONFLICT,
      message,
    });
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message: string) {
    super({
      statusCode: StatusCode.UNAUTHORIZED,
      message,
    });
  }
}
