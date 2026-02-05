import { Request, Response, NextFunction } from 'express';
import { sanitize, loggingMiddleware, logger } from '../../src/lib/logger';

jest.mock('pino', () => {
  return jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }));
});

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

describe('Logger', () => {
  describe('sanitize function', () => {
    it('should redact password field', () => {
      const data = { password: 'secret123', username: 'john' };
      const result = sanitize(data);

      expect(result.password).toBe('[REDACTED]');
      expect(result.username).toBe('john');
    });

    it('should redact token field', () => {
      const data = { token: 'eyJhbGc...', user: 'alice' };
      const result = sanitize(data);

      expect(result.token).toBe('[REDACTED]');
      expect(result.user).toBe('alice');
    });

    it('should redact access_token field', () => {
      const data = { access_token: 'bearer123', expires_in: 3600 };
      const result = sanitize(data);

      expect(result.access_token).toBe('[REDACTED]');
      expect(result.expires_in).toBe(3600);
    });

    it('should redact secret field', () => {
      const data = { secret: 'super-secret', version: '1.0' };
      const result = sanitize(data);

      expect(result.secret).toBe('[REDACTED]');
      expect(result.version).toBe('1.0');
    });

    it('should redact api_key field', () => {
      const data = { api_key: 'sk_live_123456', service: 'payment' };
      const result = sanitize(data);

      expect(result.api_key).toBe('[REDACTED]');
      expect(result.service).toBe('payment');
    });

    it('should handle nested objects', () => {
      const data = {
        user: { password: 'secret', name: 'john' },
        settings: { token: 'abc123', theme: 'dark' },
      };
      const result = sanitize(data);

      expect(result.user.password).toBe('[REDACTED]');
      expect(result.user.name).toBe('john');
      expect(result.settings.token).toBe('[REDACTED]');
      expect(result.settings.theme).toBe('dark');
    });

    it('should handle arrays of objects', () => {
      const data = [
        { password: 'secret1', id: 1 },
        { password: 'secret2', id: 2 },
      ];
      const result = sanitize(data);

      expect(result[0].password).toBe('[REDACTED]');
      expect(result[0].id).toBe(1);
      expect(result[1].password).toBe('[REDACTED]');
      expect(result[1].id).toBe(2);
    });

    it('should handle null and undefined', () => {
      expect(sanitize(null)).toBe(null);
      expect(sanitize(undefined)).toBe(undefined);
    });

    it('should handle primitive values', () => {
      expect(sanitize('string')).toBe('string');
      expect(sanitize(123)).toBe(123);
      expect(sanitize(true)).toBe(true);
    });

    it('should be case-insensitive for field names', () => {
      const data = { PASSWORD: 'secret', Token: 'abc123', AccessToken: 'xyz' };
      const result = sanitize(data);

      expect(result.PASSWORD).toBe('[REDACTED]');
      expect(result.Token).toBe('[REDACTED]');
      expect(result.AccessToken).toBe('[REDACTED]');
    });
  });

  describe('loggingMiddleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let mockSend: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();

      mockReq = {
        method: 'POST',
        originalUrl: '/transactions',
        headers: { 'content-type': 'application/json' },
        body: { user_id: '123', amount: 1000 },
        ip: '127.0.0.1',
      };

      mockSend = jest.fn((_data) => mockRes);
      mockRes = {
        send: mockSend,
        statusCode: 200,
        getHeaders: jest.fn(() => ({})),
        set: jest.fn(),
      };

      mockNext = jest.fn();
    });

    it('should attach correlation-id to request if not present', () => {
      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.headers!['x-correlation-id']).toBe('mock-uuid-1234');
      expect((mockReq as any).correlationId).toBe('mock-uuid-1234');
    });

    it('should preserve existing correlation-id from headers', () => {
      mockReq.headers = { 'x-correlation-id': 'existing-id-5678' };

      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.headers['x-correlation-id']).toBe('existing-id-5678');
      expect((mockReq as any).correlationId).toBe('existing-id-5678');
    });

    it('should call next middleware', () => {
      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should log request details', () => {
      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(logger.info).toHaveBeenCalled();
      const callArgs = (logger.info as jest.Mock).mock.calls[0][0];
      expect(callArgs.request.method).toBe('POST');
      expect(callArgs.request.url).toBe('/transactions');
      expect(callArgs.request.correlationId).toBe('mock-uuid-1234');
    });

    it('should sanitize sensitive request body fields', () => {
      mockReq.body = {
        password: 'secret123',
        username: 'john',
        token: 'abc123',
      };

      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      const callArgs = (logger.info as jest.Mock).mock.calls[0][0];
      expect(callArgs.request.body.password).toBe('[REDACTED]');
      expect(callArgs.request.body.token).toBe('[REDACTED]');
      expect(callArgs.request.body.username).toBe('john');
    });

    it('should sanitize authorization header', () => {
      mockReq.headers = {
        authorization: 'Bearer eyJhbGc...',
        'content-type': 'application/json',
      };

      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      const callArgs = (logger.info as jest.Mock).mock.calls[0][0];
      expect(callArgs.request.headers.authorization).toBe('[REDACTED]');
      expect(callArgs.request.headers['content-type']).toBe('application/json');
    });

    it('should log response details', () => {
      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      (mockRes as any).send({ id: '123', status: 'created' });

      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    it('should set correlation-id in response headers', () => {
      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      (mockRes as any).send({});

      expect(mockRes.set).toHaveBeenCalledWith('x-correlation-id', 'mock-uuid-1234');
    });

    it('should use error log level for 4xx status codes', () => {
      mockRes.statusCode = 400;

      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      (mockRes as any).send({ error: 'Bad request' });

      const errorCalls = (logger.error as jest.Mock).mock.calls;
      expect(errorCalls.length).toBeGreaterThan(0);
    });

    it('should use error log level for 5xx status codes', () => {
      mockRes.statusCode = 500;

      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      (mockRes as any).send({ error: 'Server error' });

      const errorCalls = (logger.error as jest.Mock).mock.calls;
      expect(errorCalls.length).toBeGreaterThan(0);
    });

    it('should parse JSON response body', () => {
      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      (mockRes as any).send(JSON.stringify({ id: '123', amount: 1000 }));

      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle non-JSON response body', () => {
      loggingMiddleware(mockReq as Request, mockRes as Response, mockNext);

      (mockRes as any).send('Plain text response');

      expect(logger.info).toHaveBeenCalled();
    });
  });
});
