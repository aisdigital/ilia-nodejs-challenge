import { Request, Response, NextFunction } from 'express';
import { Dictionary, isEmpty } from 'lodash';
import { ValidationError, validationResult } from 'express-validator';

export default class ErrorHandler extends Error {
  statusCode: number;
  fieldErrors: Dictionary<{ id: string; message: string }[]>;
  nonFieldErrors: Array<string>;

  constructor(
    statusCode: number,
    message: string,
    fieldErrors: Dictionary<{ id: string; message: string }[]> = {},
    nonFieldErrors: Array<string> = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    this.nonFieldErrors = nonFieldErrors;
  }
}

const parseErrors = (errors: ValidationError[]): Dictionary<{ id: string; message: string }[]> => {
  const dict = {};

  errors.forEach((error) => {
    if (dict[error.param]) {
      if (
        !dict[error.param].find((singleError: { id: string }) => singleError.id === error.msg.id)
      ) {
        dict[error.param].push(error.msg);
      }
    } else {
      dict[error.param] = [error.msg];
    }
  });

  return dict;
};

export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req).array();

    if (!isEmpty(errors))
      return next(new ErrorHandler(422, 'There are validation errors.', parseErrors(errors)));

    return next();
  } catch (error) {
    if (error instanceof ErrorHandler) {
      return next(error);
    } else {
      return next(
        new ErrorHandler(500, 'Internal Error', null, [error?.message ?? 'Internal Error']),
      );
    }
  }
};

export const errorHandlerMiddleware = async (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { statusCode, message, fieldErrors } = err;

  res.status(statusCode).json({
    message,
    field_errors: fieldErrors,
  });

  return next();
};
