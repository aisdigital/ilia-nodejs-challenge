import { BackpressureManager, BackpressureError } from '../backpressure.service';

describe('BackpressureManager', () => {
  let backpressure: BackpressureManager;

  afterEach(() => {
    backpressure?.clearQueue();
  });

  describe('acquire', () => {
    it('should allow requests under concurrent limit', async () => {
      backpressure = new BackpressureManager({
        maxConcurrent: 5,
        maxQueueSize: 10,
        queueTimeout: 1000,
        enabled: true,
      });

      const release = await backpressure.acquire();
      const status = backpressure.getStatus();

      expect(status.currentConcurrent).toBe(1);
      expect(status.isOverloaded).toBe(false);

      release();
      expect(backpressure.getStatus().currentConcurrent).toBe(0);
    });

    it('should queue requests when at limit', async () => {
      backpressure = new BackpressureManager({
        maxConcurrent: 1,
        maxQueueSize: 10,
        queueTimeout: 5000,
        enabled: true,
      });

      // First request gets through
      const release1 = await backpressure.acquire();

      // Second request should be queued
      const release2Promise = backpressure.acquire();
      
      // Give it a moment to queue
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(backpressure.getStatus().queueSize).toBe(1);

      // Release first, second should proceed
      release1();
      
      const release2 = await release2Promise;
      expect(backpressure.getStatus().currentConcurrent).toBe(1);
      expect(backpressure.getStatus().queueSize).toBe(0);

      release2();
    });

    it('should reject when queue is full', async () => {
      backpressure = new BackpressureManager({
        maxConcurrent: 1,
        maxQueueSize: 1,
        queueTimeout: 5000,
        enabled: true,
      });

      // First request
      const release1 = await backpressure.acquire();

      // Second request queued
      const _release2Promise = backpressure.acquire();
      await new Promise(resolve => setTimeout(resolve, 10));

      // Third request should be rejected (queue full)
      await expect(backpressure.acquire()).rejects.toThrow(BackpressureError);

      release1();
    });

    it('should timeout queued requests', async () => {
      backpressure = new BackpressureManager({
        maxConcurrent: 1,
        maxQueueSize: 10,
        queueTimeout: 50, // 50ms timeout
        enabled: true,
      });

      // Block the slot
      const _release1 = await backpressure.acquire();

      // Queue a request that will timeout
      await expect(backpressure.acquire()).rejects.toThrow(BackpressureError);
    }, 1000);

    it('should be no-op when disabled', async () => {
      backpressure = new BackpressureManager({
        maxConcurrent: 1,
        maxQueueSize: 1,
        queueTimeout: 100,
        enabled: false,
      });

      // Should all succeed even though limit is 1
      const release1 = await backpressure.acquire();
      const release2 = await backpressure.acquire();
      const release3 = await backpressure.acquire();

      // Status won't track when disabled
      expect(backpressure.getStatus().currentConcurrent).toBe(0);

      release1();
      release2();
      release3();
    });
  });

  describe('getStatus', () => {
    it('should return correct status', async () => {
      backpressure = new BackpressureManager({
        maxConcurrent: 2,
        maxQueueSize: 5,
        queueTimeout: 5000,
        enabled: true,
      });

      const release1 = await backpressure.acquire();
      const release2 = await backpressure.acquire();

      const status = backpressure.getStatus();
      expect(status.currentConcurrent).toBe(2);
      expect(status.isOverloaded).toBe(true);
      expect(status.queueSize).toBe(0);

      release1();
      release2();
    });
  });

  describe('getLoadFactor', () => {
    it('should return correct load factor', async () => {
      backpressure = new BackpressureManager({
        maxConcurrent: 4,
        maxQueueSize: 5,
        queueTimeout: 5000,
        enabled: true,
      });

      const release1 = await backpressure.acquire();
      expect(backpressure.getLoadFactor()).toBe(0.25);

      const release2 = await backpressure.acquire();
      expect(backpressure.getLoadFactor()).toBe(0.5);

      release1();
      release2();
    });
  });

  describe('isOverloaded', () => {
    it('should return true when above 90% capacity', async () => {
      backpressure = new BackpressureManager({
        maxConcurrent: 10,
        maxQueueSize: 5,
        queueTimeout: 5000,
        enabled: true,
      });

      // Not overloaded at low usage
      await backpressure.acquire();
      expect(backpressure.isOverloaded()).toBe(false);

      // Add more requests to reach 90%
      const releases: (() => void)[] = [];
      for (let i = 0; i < 8; i++) {
        releases.push(await backpressure.acquire());
      }

      expect(backpressure.isOverloaded()).toBe(true);

      releases.forEach(r => r());
    });
  });

  describe('clearQueue', () => {
    it('should reject all queued requests', async () => {
      backpressure = new BackpressureManager({
        maxConcurrent: 1,
        maxQueueSize: 10,
        queueTimeout: 60000, // Long timeout
        enabled: true,
      });

      // Block the slot
      const release1 = await backpressure.acquire();

      // Queue some requests
      const queuedPromise1 = backpressure.acquire();
      const queuedPromise2 = backpressure.acquire();

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(backpressure.getStatus().queueSize).toBe(2);

      // Clear queue
      backpressure.clearQueue();

      // Queued requests should be rejected
      await expect(queuedPromise1).rejects.toThrow('Server shutting down');
      await expect(queuedPromise2).rejects.toThrow('Server shutting down');

      release1();
    });
  });
});

describe('BackpressureError', () => {
  it('should have correct properties', () => {
    const error = new BackpressureError('Test message');

    expect(error.statusCode).toBe(503);
    expect(error.code).toBe('SERVICE_OVERLOADED');
    expect(error.name).toBe('BackpressureError');
    expect(error.message).toBe('Test message');
  });

  it('should have default message', () => {
    const error = new BackpressureError();
    expect(error.message).toContain('Service temporarily overloaded');
  });
});
