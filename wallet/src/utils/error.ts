import { Request, Response, NextFunction } from 'express';
import { Dictionary } from 'lodash';

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

export const errorHandlerMiddleware = async (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { statusCode, message, fieldErrors, nonFieldErrors } = err;
  res.status(statusCode).json({
    message,
    field_errors: fieldErrors,
    non_field_errors: nonFieldErrors,
  });

  next();
};
