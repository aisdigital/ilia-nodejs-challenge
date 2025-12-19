import { Logger } from '../../../infrastructure/logging/Logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = Logger.getInstance();
  });

  it('should be a singleton', () => {
    const logger2 = Logger.getInstance();
    expect(logger).toBe(logger2);
  });

  it('should log info messages', () => {
    expect(() => logger.info('Test info message', { correlationId: 'test-123' })).not.toThrow();
  });

  it('should log error messages', () => {
    expect(() => logger.error('Test error message', new Error('Test error'))).not.toThrow();
  });

  it('should handle correlation IDs', () => {
    expect(() => logger.info('Test with correlation', { 
      correlationId: 'test-correlation-123',
      userId: 'user-456'
    })).not.toThrow();
  });
});