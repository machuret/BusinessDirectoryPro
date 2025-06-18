/**
 * Stability Manager
 * Prevents recurring build failures and module loading issues
 */

interface StabilityConfig {
  cacheInterval: number;
  retryDelay: number;
  maxRetries: number;
}

class StabilityManager {
  private config: StabilityConfig = {
    cacheInterval: 30000, // 30 seconds
    retryDelay: 1000,
    maxRetries: 3
  };

  private healthCheck = {
    lastSuccess: Date.now(),
    failureCount: 0,
    isHealthy: true
  };

  // Monitor system health
  recordSuccess() {
    this.healthCheck.lastSuccess = Date.now();
    this.healthCheck.failureCount = 0;
    this.healthCheck.isHealthy = true;
  }

  recordFailure() {
    this.healthCheck.failureCount++;
    this.healthCheck.isHealthy = this.healthCheck.failureCount < 3;
  }

  // Prevent cache corruption by limiting concurrent operations
  private operationQueue: Promise<any>[] = [];

  async queueOperation<T>(operation: () => Promise<T>, name: string): Promise<T> {
    // Limit concurrent operations to prevent memory pressure
    if (this.operationQueue.length > 5) {
      console.warn(`Queuing operation ${name}, system under load`);
      await Promise.race(this.operationQueue);
    }

    const promise = operation().finally(() => {
      const index = this.operationQueue.indexOf(promise);
      if (index > -1) {
        this.operationQueue.splice(index, 1);
      }
    });

    this.operationQueue.push(promise);
    return promise;
  }

  // Enhanced fetch with automatic retry and error handling
  async stableFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return this.queueOperation(async () => {
      for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              'Cache-Control': 'no-cache',
              ...options.headers
            }
          });

          if (response.ok) {
            this.recordSuccess();
            return response;
          }

          if (response.status >= 500 && attempt < this.config.maxRetries) {
            console.warn(`Server error ${response.status}, retrying... (${attempt}/${this.config.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
            continue;
          }

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (error) {
          this.recordFailure();
          
          if (attempt === this.config.maxRetries) {
            throw error;
          }

          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }

      throw new Error('Max retries exceeded');
    }, `fetch-${url}`);
  }

  // System health status
  getSystemHealth() {
    const timeSinceLastSuccess = Date.now() - this.healthCheck.lastSuccess;
    return {
      isHealthy: this.healthCheck.isHealthy,
      failureCount: this.healthCheck.failureCount,
      lastSuccessAge: timeSinceLastSuccess,
      queueLength: this.operationQueue.length
    };
  }
}

export const stabilityManager = new StabilityManager();