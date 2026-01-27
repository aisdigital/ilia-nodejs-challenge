/**
 * Backpressure Manager
 * 
 * Implements backpressure to prevent server overload by:
 * 1. Limiting concurrent requests
 * 2. Queueing excess requests (with timeout)
 * 3. Rejecting requests when queue is full
 * 
 * This protects the server from cascading failures under high load.
 */

import { BackpressureConfig, BackpressureStatus } from './rate-limiter.types';

interface QueuedRequest {
  resolve: () => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
  enqueuedAt: number;
}

export class BackpressureError extends Error {
  public readonly statusCode = 503;
  public readonly code = 'SERVICE_OVERLOADED';

  constructor(message: string = 'Service temporarily overloaded, please retry later') {
    super(message);
    this.name = 'BackpressureError';
  }
}

export class BackpressureManager {
  private currentConcurrent = 0;
  private queue: QueuedRequest[] = [];
  private config: BackpressureConfig;
  private stats = {
    totalProcessed: 0,
    totalQueued: 0,
    totalRejected: 0,
    totalTimeouts: 0,
  };

  constructor(config: Partial<BackpressureConfig> = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent ?? 100,
      maxQueueSize: config.maxQueueSize ?? 50,
      queueTimeout: config.queueTimeout ?? 30_000, // 30 seconds
      enabled: config.enabled ?? true,
    };
  }

  /**
   * Acquire a slot for processing a request
   * Returns a release function to be called when done
   */
  async acquire(): Promise<() => void> {
    if (!this.config.enabled) {
      return () => {}; 
    }

    if (this.currentConcurrent < this.config.maxConcurrent) {
      this.currentConcurrent++;
      this.stats.totalProcessed++;
      return this.createReleaseFunction();
    }

    if (this.queue.length >= this.config.maxQueueSize) {
      this.stats.totalRejected++;
      throw new BackpressureError(
        `Server is overloaded. Queue full (${this.queue.length}/${this.config.maxQueueSize}). Please retry later.`
      );
    }

    this.stats.totalQueued++;
    return this.enqueue();
  }

  private enqueue(): Promise<() => void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.queue.findIndex(q => q.timeout === timeout);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }
        this.stats.totalTimeouts++;
        reject(new BackpressureError(
          `Request queued too long (>${this.config.queueTimeout}ms). Please retry.`
        ));
      }, this.config.queueTimeout);

      const queuedRequest: QueuedRequest = {
        resolve: () => {
          clearTimeout(timeout);
          this.currentConcurrent++;
          this.stats.totalProcessed++;
          resolve(this.createReleaseFunction());
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
        timeout,
        enqueuedAt: Date.now(),
      };

      this.queue.push(queuedRequest);
    });
  }

  private createReleaseFunction(): () => void {
    let released = false;

    return () => {
      if (released) return; 
      released = true;

      this.currentConcurrent--;

      // Process next queued request if any
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.resolve();
      }
    };
  }

  getStatus(): BackpressureStatus {
    return {
      currentConcurrent: this.currentConcurrent,
      queueSize: this.queue.length,
      isOverloaded: this.currentConcurrent >= this.config.maxConcurrent,
    };
  }

  getStats(): typeof this.stats & BackpressureStatus {
    return {
      ...this.stats,
      ...this.getStatus(),
    };
  }

  isOverloaded(): boolean {
    return this.currentConcurrent >= this.config.maxConcurrent * 0.9; // 90% threshold
  }

  getLoadFactor(): number {
    return this.currentConcurrent / this.config.maxConcurrent;
  }

  updateConfig(config: Partial<BackpressureConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  getConfig(): BackpressureConfig {
    return { ...this.config };
  }

  clearQueue(): void {
    const error = new BackpressureError('Server shutting down');
    for (const request of this.queue) {
      clearTimeout(request.timeout);
      request.reject(error);
    }
    this.queue = [];
  }
}
