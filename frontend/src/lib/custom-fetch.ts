import { env } from '~/env';
import { auth } from '~/app/(auth)/auth';
import { Response, ErrorResponse } from '~/types/actions';

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
  const session = await auth().catch(() => null);

  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...fetchOptions,
    headers: {
      ...defaultOptions.headers,
      ...fetchOptions.headers,
      ...(session?.user?.access_token
        ? { Authorization: `Bearer ${session.user.access_token}` }
        : {}),
    },
  };

  try {
    const response = await fetch(`${baseURL}${url}`, mergedOptions);
    const data = await response.json();

    if (!('data' in data)) {
      const errorResponse: ErrorResponse = {
        message: data.message,
        error: data.error,
        timestamp: new Date().toISOString(),
      };

      return errorResponse as Response<T>;
    }

    return data as Response<T>;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Network error occurred';
    const errorResponse: ErrorResponse = {
      message: errorMessage,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
    return errorResponse as Response<T>;
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
