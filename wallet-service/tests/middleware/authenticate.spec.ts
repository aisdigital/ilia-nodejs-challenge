import { Request, Response } from 'express';
import { authenticate } from '../../src/middleware/authenticate';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('authenticate middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockJsonWebToken: jest.Mocked<typeof jwt>;

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

  describe('authentication with external secret (ILIACHALLENGE)', () => {
    it('should successfully authenticate with valid external JWT token', () => {
      const validUser = { id: 'user-123', email: 'user@example.com' };
      const token = 'valid-external-token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (mockJsonWebToken.verify as jest.Mock).mockReturnValue(validUser);

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJsonWebToken.verify).toHaveBeenCalledWith(
        token,
        expect.stringContaining('ILIACHALLENGE')
      );
      expect((mockRequest as any).user).toEqual(validUser);
      expect((mockRequest as any).isInternal).toBe(false);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should attach isInternal: false for external user tokens', () => {
      const validUser = { id: 'user-456', email: 'another@example.com' };
      const token = 'external-token-xyz';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (mockJsonWebToken.verify as jest.Mock).mockReturnValue(validUser);

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).isInternal).toBe(false);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('authentication with internal secret (ILIACHALLENGE_INTERNAL)', () => {
    it('should successfully authenticate with valid internal JWT token', () => {
      const internalUser = { internal: true };
      const token = 'valid-internal-token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      const callOrder = [];
      (mockJsonWebToken.verify as jest.Mock).mockImplementation((_tok, secret) => {
        callOrder.push(secret);
        if ((secret as string).includes('ILIACHALLENGE_INTERNAL')) {
          return internalUser;
        }
        throw new Error('Invalid token');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJsonWebToken.verify).toHaveBeenCalledTimes(2);
      expect((mockRequest as any).user).toEqual(internalUser);
      expect((mockRequest as any).isInternal).toBe(true);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should attach isInternal: true for internal service tokens', () => {
      const internalPayload = { internal: true };
      const token = 'internal-token-abc';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (mockJsonWebToken.verify as jest.Mock).mockImplementation((_tok, secret) => {
        if ((secret as string).includes('ILIACHALLENGE_INTERNAL')) {
          return internalPayload;
        }
        throw new Error('Invalid');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).isInternal).toBe(true);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should try external secret first, then internal secret', () => {
      const token = 'token-123';
      const internalUser = { internal: true };

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      const verifyCallSequence: string[] = [];
      (mockJsonWebToken.verify as jest.Mock).mockImplementation((_tok, secret) => {
        verifyCallSequence.push(secret);
        if ((secret as string).includes('ILIACHALLENGE_INTERNAL')) {
          return internalUser;
        }
        throw new Error('Invalid');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(verifyCallSequence).toHaveLength(2);
      expect(verifyCallSequence[0]).toContain('ILIACHALLENGE');
      expect(verifyCallSequence[1]).toContain('ILIACHALLENGE_INTERNAL');
    });

    it('should decode token correctly with ILIACHALLENGE_INTERNAL secret', () => {
      const internalToken = {
        internal: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300,
      };
      const token = 'signed-internal-token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (mockJsonWebToken.verify as jest.Mock).mockImplementation((_tok, secret) => {
        if ((secret as string).includes('ILIACHALLENGE_INTERNAL')) {
          return internalToken;
        }
        throw new Error('Invalid');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).user).toEqual(internalToken);
      expect((mockRequest as any).user.internal).toBe(true);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return 401 if authorization header is missing', () => {
      mockRequest.headers = {};

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing authorization header',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is missing after Bearer', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if both external and internal tokens are invalid', () => {
      const token = 'invalid-token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (mockJsonWebToken.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for malformed authorization header', () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing token',
      });
    });
  });

  describe('dual authentication flow', () => {
    it('should successfully authenticate with external token when internal fails', () => {
      const externalUser = { id: 'user-789' };
      const token = 'external-token-only';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (mockJsonWebToken.verify as jest.Mock).mockImplementation((_tok, secret) => {
        if ((secret as string).includes('ILIACHALLENGE_INTERNAL')) {
          throw new Error('Invalid internal token');
        }
        return externalUser;
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).user).toEqual(externalUser);
      expect((mockRequest as any).isInternal).toBe(false);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should distinguish between external and internal tokens correctly', () => {
      const externalToken = 'external-token-123';
      const internalToken = 'internal-token-456';

      // First call with external token
      mockRequest.headers = { authorization: `Bearer ${externalToken}` };
      (mockJsonWebToken.verify as jest.Mock).mockReturnValue({ id: 'user-123' });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      expect((mockRequest as any).isInternal).toBe(false);

      // Reset and second call with internal token
      jest.clearAllMocks();
      mockNext.mockClear();
      mockResponse.status = jest.fn().mockReturnThis();
      mockResponse.json = jest.fn().mockReturnThis();

      mockRequest.headers = { authorization: `Bearer ${internalToken}` };
      (mockJsonWebToken.verify as jest.Mock).mockImplementation((_tok, secret) => {
        if ((secret as string).includes('ILIACHALLENGE_INTERNAL')) {
          return { internal: true };
        }
        throw new Error('Invalid');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      expect((mockRequest as any).isInternal).toBe(true);
    });

    it('should not proceed if neither external nor internal secret matches', () => {
      const token = 'completely-invalid-token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (mockJsonWebToken.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
      expect((mockRequest as any).user).toBeUndefined();
      expect((mockRequest as any).isInternal).toBeUndefined();
    });
  });

  describe('request object modification', () => {
    it('should attach decoded user data to request', () => {
      const userData = {
        id: 'user-999',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      const token = 'token-with-full-data';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (mockJsonWebToken.verify as jest.Mock).mockReturnValue(userData);

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).user).toEqual(userData);
      expect((mockRequest as any).user.id).toBe('user-999');
      expect((mockRequest as any).user.email).toBe('test@example.com');
    });

    it('should attach both user and isInternal to request object', () => {
      const internalPayload = { internal: true };
      const token = 'internal-token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (mockJsonWebToken.verify as jest.Mock).mockImplementation((_tok, secret) => {
        if ((secret as string).includes('ILIACHALLENGE_INTERNAL')) {
          return internalPayload;
        }
        throw new Error('Invalid');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect((mockRequest as any).user).toBeDefined();
      expect((mockRequest as any).isInternal).toBeDefined();
      expect((mockRequest as any).user).toEqual(internalPayload);
      expect((mockRequest as any).isInternal).toBe(true);
    });
  });
});
