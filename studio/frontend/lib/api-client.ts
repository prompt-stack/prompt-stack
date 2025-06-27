/**
 * Enhanced API client with timeout, cancellation, and retry support
 */

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private controllers: Map<string, AbortController>;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', defaultTimeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
    this.controllers = new Map();
  }

  /**
   * Make a request with timeout and retry support
   */
  private async request<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = 0,
      retryDelay = 1000,
      ...fetchConfig
    } = config;

    // Create abort controller for this request
    const controller = new AbortController();
    const requestId = `${url}-${Date.now()}`;
    this.controllers.set(requestId, controller);

    // Setup timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${url}`,
        {
          ...fetchConfig,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...fetchConfig.headers,
          },
        },
        retries,
        retryDelay
      );

      clearTimeout(timeoutId);
      this.controllers.delete(requestId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          error.error || `HTTP ${response.status}`,
          error.code,
          response.status,
          error.data
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      this.controllers.delete(requestId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 'TIMEOUT');
        }
        throw new ApiError(error.message, 'NETWORK_ERROR');
      }

      throw new ApiError('Unknown error occurred', 'UNKNOWN_ERROR');
    }
  }

  /**
   * Fetch with exponential backoff retry
   */
  private async fetchWithRetry(
    url: string,
    config: RequestInit,
    retries: number,
    delay: number
  ): Promise<Response> {
    try {
      return await fetch(url, config);
    } catch (error) {
      if (retries === 0 || (error as any).name === 'AbortError') {
        throw error;
      }

      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry with doubled delay
      return this.fetchWithRetry(url, config, retries - 1, delay * 2);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    this.controllers.forEach(controller => controller.abort());
    this.controllers.clear();
  }

  /**
   * Cancel specific request by URL pattern
   */
  cancel(urlPattern: string): void {
    this.controllers.forEach((controller, key) => {
      if (key.includes(urlPattern)) {
        controller.abort();
        this.controllers.delete(key);
      }
    });
  }

  // HTTP methods
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for use in components
export { ApiError };