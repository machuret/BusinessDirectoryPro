/**
 * Module Error Handler
 * Prevents dynamic import failures and provides fallback recovery
 */

export class ModuleErrorHandler {
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;

  async handleDynamicImport<T>(
    importFn: () => Promise<T>,
    moduleName: string
  ): Promise<T> {
    const attempts = this.retryAttempts.get(moduleName) || 0;

    try {
      const result = await importFn();
      // Reset retry count on success
      this.retryAttempts.delete(moduleName);
      return result;
    } catch (error) {
      console.warn(`Module import failed: ${moduleName}`, error);

      if (attempts < this.maxRetries) {
        this.retryAttempts.set(moduleName, attempts + 1);
        
        // Progressive delay: 500ms, 1000ms, 2000ms
        const delay = Math.pow(2, attempts) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.handleDynamicImport(importFn, moduleName);
      }

      // After max retries, provide fallback
      throw new Error(`Failed to load ${moduleName} after ${this.maxRetries} attempts`);
    }
  }

  clearCache() {
    this.retryAttempts.clear();
  }
}

export const moduleErrorHandler = new ModuleErrorHandler();