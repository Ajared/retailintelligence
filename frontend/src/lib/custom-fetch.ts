import { env } from '~/env';
import { ErrorResponse, Response, SuccessResponse } from '~/types/actions';

interface FetchOptions extends RequestInit {
  baseURL?: string;
}

const defaultOptions: FetchOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

async function customFetcher<T>(
  url: string,
  options: FetchOptions = {},
): Promise<Response<T>> {
  const { baseURL = env.API_URL, ...fetchOptions } = options;

  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...fetchOptions,
    headers: {
      ...defaultOptions.headers,
      ...fetchOptions.headers,
    },
  };

  try {
    const response = await fetch(`${baseURL}${url}`, mergedOptions);
    const data = (await response.json()) as Response<T>;

    if (!('data' in data)) {
      return {
        message: data.message,
        error: data.error,
        timestamp: new Date(),
      } as ErrorResponse;
    }

    return data as SuccessResponse<T>;
  } catch (error) {
    if (error instanceof Error) {
      return {
        message: error.message,
        error: error.message,
        timestamp: new Date(),
      } as ErrorResponse;
    }

    return {
      message: 'Network error occurred',
      error: 'Network error occurred',
      timestamp: new Date(),
    } as ErrorResponse;
  }
}

export const customFetch = {
  get: <T>(url: string, options?: FetchOptions) =>
    customFetcher<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    customFetcher<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    customFetcher<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    customFetcher<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(url: string, options?: FetchOptions) =>
    customFetcher<T>(url, { ...options, method: 'DELETE' }),
};

export default customFetch;
