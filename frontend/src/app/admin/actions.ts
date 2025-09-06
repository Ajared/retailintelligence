'use server';

import { z } from 'zod/v4';
import { UserInterface } from '~/types/user';
import customFetch from '~/lib/custom-fetch';
import { StoreInterface } from '~/types/store';
import { collectErrorMessages } from '~/lib/utils';
import type {
  Response,
  ErrorResponse,
  PaginatedSuccessResponse,
} from '~/types/actions';
import { InviteUserFormData, inviteUserFormSchema } from './schema';

export const getAllStores = async (
  page: number = 1,
  limit: number = 20,
  sort: string = 'ASC',
  stateId?: string,
  localGovernmentId?: string,
  enumeratorId?: string,
  name?: string,
): Promise<Response<StoreInterface[]>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    if (stateId) queryParams.append('stateId', stateId);
    if (localGovernmentId)
      queryParams.append('localGovernmentId', localGovernmentId);
    if (enumeratorId) queryParams.append('enumeratorId', enumeratorId);
    if (name && name.trim().length > 0) queryParams.append('name', name.trim());

    const response = await customFetch.get<StoreInterface[]>(
      `/admin/stores?${queryParams.toString()}`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const getStoreById = async (
  storeId: string,
): Promise<Response<StoreInterface>> => {
  try {
    const response = await customFetch.get<StoreInterface>(
      `/admin/stores/${storeId}`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const getAllUsers = async (
  page: number = 1,
  limit: number = 20,
  sort: string = 'ASC',
  role?: string,
  status?: string,
): Promise<Response<UserInterface[]>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    if (role) queryParams.append('role', role);
    if (status) queryParams.append('status', status);

    const response = await customFetch.get<UserInterface[]>(
      `/admin/users?${queryParams.toString()}`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const deactivateUser = async (
  userId: string,
): Promise<Response<UserInterface>> => {
  try {
    const response = await customFetch.post<UserInterface>(
      `/admin/users/${userId}/deactivate`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const reactivateUser = async (
  userId: string,
): Promise<Response<UserInterface>> => {
  try {
    const response = await customFetch.post<UserInterface>(
      `/admin/users/${userId}/reactivate`,
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const inviteUser = async (
  _: Response<{ email: string } | null>,
  formData: FormData,
) => {
  let rawData: InviteUserFormData | null = null;

  try {
    rawData = {
      email: formData.get('email') as string,
      role: formData.get('role') as 'user' | 'admin',
    };

    const validatedData = inviteUserFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: InviteUserFormData };
    }

    const { email, role } = validatedData.data;

    const response = await customFetch.post<{ email: string }>('/auth/invite', {
      email,
      role,
    });

    if (!('data' in response)) {
      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: InviteUserFormData };
    }

    return response;
  } catch (error) {
    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Something went wrong',
    } as ErrorResponse & { inputs: InviteUserFormData };
  }
};

export const assignLocation = async (params: {
  stateId: string;
  localGovernmentId: string;
  phaseId: string | undefined;
  districtId: string | undefined;
  enumeratorId: string;
}) => {
  try {
    const { stateId, localGovernmentId, phaseId, districtId, enumeratorId } =
      params;
    const response = await customFetch.post<StoreInterface>(
      `/admin/users/${enumeratorId}/assign-location`,
      {
        stateId,
        localGovernmentId,
        phaseId,
        districtId,
      },
    );

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};

export const getAdminMapData = async (
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  opts: {
    page?: number;
    limit?: number;
    sort?: 'ASC' | 'DESC';
    name?: string;
  } = {},
): Promise<Response<StoreInterface[]>> => {
  try {
    const { page = 1, limit = 20, sort = 'ASC' } = opts;
    const allData: StoreInterface[] = [];
    let currentPage = page;
    let hasNext = true;
    let compiledResponse: PaginatedSuccessResponse<StoreInterface[]> | null =
      null;
    const MAX_PAGES = 50;

    while (hasNext && currentPage <= MAX_PAGES) {
      const params = new URLSearchParams({
        minLat: String(bounds.minLat),
        maxLat: String(bounds.maxLat),
        minLng: String(bounds.minLng),
        maxLng: String(bounds.maxLng),
        page: String(currentPage),
        limit: String(limit),
        sort,
      });
      if (opts.name && opts.name.trim().length > 0) {
        params.append('name', opts.name.trim());
      }
      const response = await customFetch.get<StoreInterface[]>(
        `/admin/stores?${params.toString()}`,
      );

      if (!('data' in response)) {
        throw new Error(response.message);
      }

      allData.push(...response.data);

      compiledResponse = response;
      if (!response.meta || typeof response.meta.has_next !== 'boolean') {
        throw new Error('Invalid pagination metadata');
      }
      hasNext = response.meta.has_next;
      currentPage++;
    }

    if (!compiledResponse) {
      throw new Error('No data fetched');
    }

    return {
      ...compiledResponse,
      data: allData,
      meta: {
        ...compiledResponse.meta,
        has_next: false,
        total: allData.length,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  }
};
