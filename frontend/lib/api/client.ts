import type { ApiResponse, ApiError, RequestConfig } from '@/lib/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://shine.local.test/api';

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

/**
 * Set authentication token to storage
 */
export function setAuthToken(token: string, persistent = true): void {
  if (typeof window === 'undefined') return;
  if (persistent) {
    localStorage.setItem('auth_token', token);
  } else {
    sessionStorage.setItem('auth_token', token);
  }
}

/**
 * Remove authentication token from storage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
}

/**
 * API Client with authentication and error handling
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Make an API request with authentication and error handling
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    let url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Handle query params
    if (config.params && typeof config.params === 'object') {
      const searchParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers,
    };

    // Add authentication token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Handle request body
    let body: string | FormData | undefined;
    if (config.body instanceof FormData) {
      // If body is FormData, don't set Content-Type header (browser will set it with boundary)
      body = config.body;
      delete headers['Content-Type'];
    } else if (config.body && typeof config.body === 'object') {
      body = JSON.stringify(config.body);
    } else if (config.body) {
      body = config.body as string;
    }

    try {
      const response = await fetch(url, {
        ...config,
        headers,
        body,
      });

      const data = await response.json();

      // Handle non-2xx responses
      if (!response.ok) {
        const error: ApiError = {
          success: false,
          message: data.message || `HTTP Error: ${response.status}`,
          errors: data.errors,
        };

        // Handle 401 Unauthorized - clear token
        // Don't redirect automatically to avoid refresh loops
        // Let components handle redirect based on their context
        if (response.status === 401) {
          removeAuthToken();
        }

        throw error;
      }

      // Handle successful response
      if (data.success === false) {
        throw data as ApiError;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      // Handle network errors or other exceptions
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          success: false,
          message: 'Network error: Unable to connect to the server',
        } as ApiError;
      }

      // Re-throw if it's already an ApiError
      if (typeof error === 'object' && error !== null && 'success' in error) {
        throw error;
      }

      // Wrap unknown errors
      throw {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances if needed
export default ApiClient;

