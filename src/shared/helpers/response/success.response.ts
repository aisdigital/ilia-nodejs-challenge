import { IProps } from "../../interfaces/props.interface";

abstract class ServiceResponse {
  constructor(props: IProps) {
    Object.assign(this, props);
  }
}

class SuccessResponse extends ServiceResponse {
  constructor(props: Omit<ServiceResponse, "statusCode">) {
    super({
      statusCode: 200,
      ...props,
    });
  }
}

class CreatedResponse extends ServiceResponse {
  constructor(props: Omit<ServiceResponse, "statusCode">) {
    super({
      statusCode: 201,
      ...props,
    });
  }
}

class NoContentResponse extends ServiceResponse {
  constructor(props: Omit<ServiceResponse, "statusCode">) {
    super({
      statusCode: 204,
      ...props,
    });
  }
}

export { ServiceResponse, SuccessResponse, CreatedResponse, NoContentResponse };
