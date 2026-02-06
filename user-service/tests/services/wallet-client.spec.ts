// Set environment variable BEFORE importing WalletClient
process.env.WALLET_SERVICE_URL = 'http://wallet-service:3001';
process.env.INTERNAL_JWT_SECRET = 'test-secret';

import { WalletClient } from '../../src/clients/wallet.client';
import { BalanceResponse } from '../../src/types/wallet-client.types';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

jest.mock('axios');
jest.mock('jsonwebtoken');
jest.mock('../../src/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  getCorrelationId: jest.fn(() => 'test-correlation-id'),
  setCorrelationId: jest.fn(),
  sanitize: jest.fn((obj) => obj),
}));

describe('WalletClient', () => {
  let walletClient: WalletClient;
  let mockAxiosGet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosGet = jest.fn();

    (axios.create as jest.Mock).mockReturnValue({
      get: mockAxiosGet,
    });

    walletClient = new WalletClient();
  });

  afterEach(() => {
    // Environment variable is kept for other tests
  });

  describe('getUserBalance', () => {
    it('should successfully fetch balance with valid JWT token', async () => {
      const userId = 'user-123';
      const expectedBalance: BalanceResponse = { amount: 1500 };
      const mockToken = 'mock-jwt-token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: expectedBalance });

      const result = await walletClient.getUserBalance(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { internal: true },
        expect.any(String),
        { expiresIn: '5m' }
      );
      expect(mockAxiosGet).toHaveBeenCalledWith('/balance', {
        params: {
          user_id: userId,
        },
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
      expect(result).toEqual(expectedBalance);
    });

    it('should generate JWT token using configured secret', async () => {
      const userId = 'user-secret';
      const mockToken = 'mock-token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 5000 } });

      await walletClient.getUserBalance(userId);

      const signCall = (jwt.sign as jest.Mock).mock.calls[0];
      expect(signCall[0]).toEqual({ internal: true });
      expect(typeof signCall[1]).toBe('string');
      expect(signCall[2]).toEqual({ expiresIn: '5m' });
    });

    it('should generate JWT with 5 minute expiration', async () => {
      const userId = 'user-expiry';
      const mockToken = 'mock-token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 0 } });

      await walletClient.getUserBalance(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        { expiresIn: '5m' }
      );
    });

    it('should send user ID in query parameter', async () => {
      const userId = 'specific-user-123';
      const mockToken = 'mock-token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 1000 } });

      await walletClient.getUserBalance(userId);

      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/balance',
        expect.objectContaining({
          params: expect.objectContaining({
            user_id: userId,
          }),
        })
      );
    });

    it('should send Bearer token in Authorization header', async () => {
      const userId = 'user-auth';
      const mockToken = 'specific-jwt-token-abc123';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 500 } });

      await walletClient.getUserBalance(userId);

      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/balance',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });
  });

  describe('Authorization header verification', () => {
    it('should send Authorization header with Bearer token prefix', async () => {
      const userId = 'user-bearer-test';
      const mockToken = 'jwt-token-12345';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 2000 } });

      await walletClient.getUserBalance(userId);

      const callArgs = mockAxiosGet.mock.calls[0][1];
      expect(callArgs.headers.Authorization).toMatch(/^Bearer /);
      expect(callArgs.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should include correct Authorization header format', async () => {
      const userId = 'user-auth-format';
      const mockToken = 'token-xyz789';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 3000 } });

      await walletClient.getUserBalance(userId);

      const headers = mockAxiosGet.mock.calls[0][1].headers;
      expect(headers.Authorization).not.toBeNull();
      expect(headers.Authorization).not.toBeUndefined();
      expect(headers.Authorization.startsWith('Bearer ')).toBe(true);
    });

    it('should pass JWT token in Authorization header, not in body', async () => {
      const userId = 'user-header-only';
      const mockToken = 'token-not-in-body';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 1500 } });

      await walletClient.getUserBalance(userId);

      const callArgs = mockAxiosGet.mock.calls[0][1];
      expect(callArgs.headers.Authorization).toContain(mockToken);
      expect(callArgs.data).toBeUndefined();
      expect(callArgs.body).toBeUndefined();
    });

    it('should use generated JWT token in Authorization header', async () => {
      const userId = 'user-generated-token';
      const generatedToken = 'generated-jwt-abc123xyz';

      (jwt.sign as jest.Mock).mockReturnValue(generatedToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 4000 } });

      await walletClient.getUserBalance(userId);

      const authHeader = mockAxiosGet.mock.calls[0][1].headers.Authorization;
      expect(authHeader).toBe(`Bearer ${generatedToken}`);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should not include password or sensitive data in Authorization header', async () => {
      const userId = 'user-secure';
      const mockToken = 'secure-token-only';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 500 } });

      await walletClient.getUserBalance(userId);

      const authHeader = mockAxiosGet.mock.calls[0][1].headers.Authorization;
      expect(authHeader).not.toContain('password');
      expect(authHeader).not.toContain('secret');
      expect(authHeader).not.toContain(userId);
    });
  });

  describe('URL and endpoint verification', () => {
    it('should call /balance endpoint', async () => {
      const userId = 'user-endpoint-test';
      const mockToken = 'token-endpoint';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 1000 } });

      await walletClient.getUserBalance(userId);

      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/balance',
        expect.any(Object)
      );
    });

    it('should use correct endpoint path', async () => {
      const userId = 'user-path-test';
      const mockToken = 'token-path';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 2500 } });

      await walletClient.getUserBalance(userId);

      const endpointPath = mockAxiosGet.mock.calls[0][0];
      expect(endpointPath).toBe('/balance');
      expect(endpointPath).not.toBe('/balances');
      expect(endpointPath).not.toBe('balance');
    });

    it('should not include user_id in URL path', async () => {
      const userId = 'user-not-in-path';
      const mockToken = 'token-not-path';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 1800 } });

      await walletClient.getUserBalance(userId);

      const endpointPath = mockAxiosGet.mock.calls[0][0];
      expect(endpointPath).not.toContain(userId);
      expect(endpointPath).toBe('/balance');
    });

    it('should pass user_id as query parameter, not in path', async () => {
      const userId = 'user-123-query';
      const mockToken = 'token-query';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 3200 } });

      await walletClient.getUserBalance(userId);

      const config = mockAxiosGet.mock.calls[0][1];
      expect(config.params.user_id).toBe(userId);
      const path = mockAxiosGet.mock.calls[0][0];
      expect(path).not.toContain(userId);
    });

    it('should call axios get method with correct parameters', async () => {
      const userId = 'user-axios-params';
      const mockToken = 'token-axios';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 6000 } });

      await walletClient.getUserBalance(userId);

      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
      const callArgs = mockAxiosGet.mock.calls[0];
      expect(callArgs).toHaveLength(2);
      expect(typeof callArgs[0]).toBe('string');
      expect(typeof callArgs[1]).toBe('object');
    });

    it('should use configured base URL from axios instance', async () => {
      const userId = 'user-base-url';
      const mockToken = 'token-base';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 9999 } });

      // Verify axios.create was called to set baseURL
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('wallet'),
        })
      );

      await walletClient.getUserBalance(userId);

      expect(mockAxiosGet).toHaveBeenCalledWith('/balance', expect.any(Object));
    });
  });

  describe('complete request validation', () => {
    it('should send complete valid request to Wallet Service', async () => {
      const userId = 'user-complete-request';
      const mockToken = 'complete-token-xyz';
      const expectedBalance = { amount: 7500 };

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: expectedBalance });

      const result = await walletClient.getUserBalance(userId);

      // Verify complete request structure
      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/balance',
        {
          params: {
            user_id: userId,
          },
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );

      expect(result).toEqual(expectedBalance);
    });

    it('should include all required headers in request', async () => {
      const userId = 'user-all-headers';
      const mockToken = 'headers-token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 1200 } });

      await walletClient.getUserBalance(userId);

      const config = mockAxiosGet.mock.calls[0][1];
      expect(config.headers).toBeDefined();
      expect(config.headers.Authorization).toBeDefined();
      expect(Object.keys(config.headers)).toContain('Authorization');
    });

    it('should include all required query parameters in request', async () => {
      const userId = 'user-all-params';
      const mockToken = 'params-token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 4400 } });

      await walletClient.getUserBalance(userId);

      const config = mockAxiosGet.mock.calls[0][1];
      expect(config.params).toBeDefined();
      expect(config.params.user_id).toBeDefined();
      expect(config.params.user_id).toBe(userId);
      expect(Object.keys(config.params)).toContain('user_id');
    });
  });

  describe('error handling', () => {
    it('should handle connection refused error gracefully', async () => {
      const userId = 'user-789';
      const mockToken = 'mock-token';
      const connectionError = new Error('connect ECONNREFUSED') as any;
      connectionError.code = 'ECONNREFUSED';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(connectionError);

      const result = await walletClient.getUserBalance(userId);

      expect(result).toEqual({ amount: null });
    });

    it('should handle wallet service timeout', async () => {
      const userId = 'user-timeout';
      const mockToken = 'mock-token';
      const timeoutError = new Error('timeout') as any;
      timeoutError.code = 'ECONNABORTED';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(timeoutError);

      const result = await walletClient.getUserBalance(userId);

      expect(result).toEqual({ amount: null });
    });

    it('should handle 401 unauthorized error gracefully', async () => {
      const userId = 'user-401';
      const mockToken = 'invalid-token';
      const unauthorizedError = new Error('Unauthorized') as any;
      unauthorizedError.response = { status: 401 };
      unauthorizedError.isAxiosError = true;
      unauthorizedError.code = 'ERR_BAD_REQUEST';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(unauthorizedError);

      const result = await walletClient.getUserBalance(userId);

      expect(result).toEqual({ amount: null });
    });

    it('should handle 404 not found error gracefully', async () => {
      const userId = 'user-404';
      const mockToken = 'mock-token';
      const notFoundError = new Error('Not Found') as any;
      notFoundError.response = { status: 404 };
      notFoundError.isAxiosError = true;
      notFoundError.code = 'ERR_NOT_FOUND';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(notFoundError);

      const result = await walletClient.getUserBalance(userId);

      expect(result).toEqual({ amount: null });
    });

    it('should return null balance on 500 server error', async () => {
      const userId = 'user-500';
      const mockToken = 'mock-token';
      const serverError = new Error('Server Error') as any;
      serverError.response = { status: 500 };
      serverError.isAxiosError = true;
      serverError.code = 'ERR_BAD_RESPONSE';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(serverError);

      const result = await walletClient.getUserBalance(userId);

      expect(result).toEqual({ amount: null });
    });

    it('should return null balance on unexpected non-axios errors', async () => {
      const userId = 'user-unexpected';
      const mockToken = 'mock-token';
      const unexpectedError = new Error('Unexpected error');

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(unexpectedError);

      const result = await walletClient.getUserBalance(userId);

      expect(result).toEqual({ amount: null });
    });

    it('should handle ENOTFOUND (DNS resolution failure) gracefully', async () => {
      const userId = 'user-dns-fail';
      const mockToken = 'mock-token';
      const dnsError = new Error('getaddrinfo ENOTFOUND wallet-service') as any;
      dnsError.code = 'ENOTFOUND';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(dnsError);

      const result = await walletClient.getUserBalance(userId);

      expect(result).toEqual({ amount: null });
    });
  });
});
