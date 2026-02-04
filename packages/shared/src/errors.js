export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const Errors = {
  unauthorized: (msg = 'Unauthorized') => new AppError(msg, 401, 'UNAUTHORIZED'),
  forbidden: (msg = 'Forbidden') => new AppError(msg, 403, 'FORBIDDEN'),
  badRequest: (msg = 'Bad Request') => new AppError(msg, 400, 'BAD_REQUEST'),
  notFound: (msg = 'Not Found') => new AppError(msg, 404, 'NOT_FOUND'),
};
