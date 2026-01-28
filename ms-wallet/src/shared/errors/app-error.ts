export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InsufficientBalanceError extends AppError {
  constructor(message: string = 'Insufficient balance to perform this operation.') {
    super(message, 400, 'INSUFFICIENT_BALANCE');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`'${resource}' not found`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Invalid data provided.') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access.') {
    super(message, 401, 'UNAUTHORIZED');
  } 
}
