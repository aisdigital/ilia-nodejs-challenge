import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipeOptions,
} from "@nestjs/common";

const validationPipeConfigs = (
  overrideOptions: ValidationPipeOptions
): ValidationPipeOptions => {
  return {
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    validationError: {
      target: false,
    },
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    ...overrideOptions,
  };
};

export default validationPipeConfigs;
