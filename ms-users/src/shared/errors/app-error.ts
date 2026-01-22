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

export class UserNotFoundError extends AppError {
  constructor(message: string = 'User not found') {
    super(message, 404, 'USER_NOT_FOUND');
  }
}

export class DuplicateEmailError extends AppError {
  constructor(message: string = 'Email already exists') {
    super(message, 409, 'DUPLICATE_EMAIL');
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 401, 'INVALID_CREDENTIALS');
  }
}

export class UserAlreadyDeletedException extends AppError {
  constructor(message: string = 'User has been deleted') {
    super(message, 410, 'USER_DELETED');
  }
}
