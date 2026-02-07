import { Request, Response } from 'express';
import { authenticate } from '../../src/middleware/authenticate';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('authenticate middleware - Internal Token Only', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockJsonWebToken: jest.Mocked<typeof jwt>;
  const INTERNAL_JWT_SECRET = process.env.INTERNAL_JWT_SECRET || 'test-internal-secret';

  beforeEach(() => {
    jest.clearAllMocks();
    mockJsonWebToken = jwt as jest.Mocked<typeof jwt>;

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  it('should successfully authenticate with valid internal JWT token', () => {
    const internalPayload = { internal: true };
    const token = 'valid-internal-token';

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    (mockJsonWebToken.verify as jest.Mock).mockReturnValue(internalPayload);

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockJsonWebToken.verify).toHaveBeenCalledWith(token, INTERNAL_JWT_SECRET);
    expect((mockRequest as any).service).toEqual(internalPayload);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 401 with invalid token', () => {
    const token = 'invalid-token';

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    (mockJsonWebToken.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockJsonWebToken.verify).toHaveBeenCalledWith(token, INTERNAL_JWT_SECRET);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid or expired internal token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with expired token', () => {
    const token = 'expired-token';

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    (mockJsonWebToken.verify as jest.Mock).mockImplementation(() => {
      const err: any = new Error('TokenExpiredError');
      err.name = 'TokenExpiredError';
      throw err;
    });

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid or expired internal token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header is missing', () => {
    mockRequest.headers = {};

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Missing authorization header',
    });
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockJsonWebToken.verify).not.toHaveBeenCalled();
  });

  it('should return 401 when token is missing from header', () => {
    mockRequest.headers = {
      authorization: 'Bearer',
    };

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Missing token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should not accept external user tokens', () => {
    const token = 'external-user-token';

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    (mockJsonWebToken.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid or expired internal token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should attach service payload to request', () => {
    const servicePayload = { internal: true, service: 'user-service' };
    const token = 'service-token';

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    (mockJsonWebToken.verify as jest.Mock).mockReturnValue(servicePayload);

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect((mockRequest as any).service).toEqual(servicePayload);
    expect(mockNext).toHaveBeenCalled();
  });
});
