import { WalletClient, BalanceResponse } from '../../src/services/WalletClient';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

jest.mock('axios');
jest.mock('jsonwebtoken');

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
        headers: {
          Authorization: `Bearer ${mockToken}`,
          'X-User-Id': userId,
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

    it('should send user ID in X-User-Id header', async () => {
      const userId = 'specific-user-123';
      const mockToken = 'mock-token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockResolvedValueOnce({ data: { amount: 1000 } });

      await walletClient.getUserBalance(userId);

      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/balance',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-User-Id': userId,
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

  describe('error handling', () => {
    it('should handle connection refused error gracefully', async () => {
      const userId = 'user-789';
      const mockToken = 'mock-token';
      const connectionError = new Error('connect ECONNREFUSED') as any;
      connectionError.code = 'ECONNREFUSED';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(connectionError);

      const result = await walletClient.getUserBalance(userId);

      expect(result).toEqual({ amount: 0 });
    });

    it('should handle wallet service timeout', async () => {
      const userId = 'user-timeout';
      const mockToken = 'mock-token';
      const timeoutError = new Error('timeout') as any;
      timeoutError.code = 'ECONNABORTED';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(timeoutError);

      await expect(walletClient.getUserBalance(userId)).rejects.toThrow(
        'Wallet service timeout'
      );
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

      expect(result).toEqual({ amount: 0 });
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

      expect(result).toEqual({ amount: 0 });
    });

    it('should throw error on 500 server error', async () => {
      const userId = 'user-500';
      const mockToken = 'mock-token';
      const serverError = new Error('Server Error') as any;
      serverError.response = { status: 500 };
      serverError.isAxiosError = true;
      serverError.code = 'ERR_BAD_RESPONSE';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(serverError);

      await expect(walletClient.getUserBalance(userId)).rejects.toThrow(
        'Wallet service error'
      );
    });

    it('should handle unexpected non-axios errors', async () => {
      const userId = 'user-unexpected';
      const mockToken = 'mock-token';
      const unexpectedError = new Error('Unexpected error');

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(unexpectedError);

      await expect(walletClient.getUserBalance(userId)).rejects.toThrow(
        'Failed to fetch wallet balance'
      );
    });

    it('should handle ENOTFOUND (DNS resolution failure) gracefully', async () => {
      const userId = 'user-dns-fail';
      const mockToken = 'mock-token';
      const dnsError = new Error('getaddrinfo ENOTFOUND wallet-service') as any;
      dnsError.code = 'ENOTFOUND';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      mockAxiosGet.mockRejectedValueOnce(dnsError);

      const result = await walletClient.getUserBalance(userId);

      expect(result).toEqual({ amount: 0 });
    });
  });
});
