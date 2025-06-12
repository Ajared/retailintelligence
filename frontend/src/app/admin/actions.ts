'use server';

import { z } from 'zod/v4';
import { auth } from '../(auth)/auth';
import PostHogClient from '~/lib/posthog';
import { UserInterface } from '~/types/user';
import customFetch from '~/lib/custom-fetch';
import { StoreInterface } from '~/types/store';
import { collectErrorMessages } from '~/lib/utils';
import { Response, ErrorResponse } from '~/types/actions';
import { InviteUserFormData, inviteUserFormSchema } from './schema';

export const getAllStores = async (
  page: number = 1,
  limit: number = 20,
  sort: string = 'ASC',
  stateId?: string,
  localGovernmentId?: string,
  enumeratorId?: string,
): Promise<Response<StoreInterface[]>> => {
  const session = await auth();
  const posthog = PostHogClient();
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

    const response = await customFetch.get<StoreInterface[]>(
      `/admin/stores?${queryParams.toString()}`,
    );

    if (!('data' in response)) {
      posthog.capture({
        event: 'get_all_stores_error',
        properties: response,
        distinctId: session?.user?.id!,
      });
      throw new Error(response.message);
    }

    posthog.capture({
      event: 'get_all_stores_success',
      properties: response,
      distinctId: session?.user?.id!,
    });
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  } finally {
    await posthog.shutdown();
  }
};

export const getStoreById = async (
  storeId: string,
): Promise<Response<StoreInterface>> => {
  const session = await auth();
  const posthog = PostHogClient();
  try {
    const response = await customFetch.get<StoreInterface>(
      `/admin/stores/${storeId}`,
    );

    if (!('data' in response)) {
      posthog.capture({
        event: 'get_store_by_id_error',
        properties: response,
        distinctId: session?.user?.id!,
      });
      throw new Error(response.message);
    }

    posthog.capture({
      event: 'get_store_by_id_success',
      properties: response,
      distinctId: session?.user?.id!,
    });
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  } finally {
    await posthog.shutdown();
  }
};

export const getAllUsers = async (
  page: number = 1,
  limit: number = 20,
  sort: string = 'ASC',
  role?: string,
  status?: string,
): Promise<Response<UserInterface[]>> => {
  const session = await auth();
  const posthog = PostHogClient();
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
      posthog.capture({
        event: 'get_all_users_error',
        properties: response,
        distinctId: session?.user?.id!,
      });
      throw new Error(response.message);
    }

    posthog.capture({
      event: 'get_all_users_success',
      properties: response,
      distinctId: session?.user?.id!,
    });
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  } finally {
    await posthog.shutdown();
  }
};

export const deactivateUser = async (
  userId: string,
): Promise<Response<UserInterface>> => {
  const session = await auth();
  const posthog = PostHogClient();
  try {
    const response = await customFetch.post<UserInterface>(
      `/admin/users/deactivate`,
      {
        userId,
      },
    );

    if (!('data' in response)) {
      posthog.capture({
        event: 'deactivate_user_error',
        properties: response,
        distinctId: session?.user?.id!,
      });
      throw new Error(response.message);
    }

    posthog.capture({
      event: 'deactivate_user_success',
      properties: response,
      distinctId: session?.user?.id!,
    });
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  } finally {
    await posthog.shutdown();
  }
};

export const reactivateUser = async (
  userId: string,
): Promise<Response<UserInterface>> => {
  const session = await auth();
  const posthog = PostHogClient();
  try {
    const response = await customFetch.post<UserInterface>(
      `/admin/users/reactivate`,
      {
        userId,
      },
    );

    if (!('data' in response)) {
      posthog.capture({
        event: 'reactivate_user_error',
        properties: response,
        distinctId: session?.user?.id!,
      });
      throw new Error(response.message);
    }

    posthog.capture({
      event: 'reactivate_user_success',
      properties: response,
      distinctId: session?.user?.id!,
    });
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return {
      error: errorMessage,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    } as ErrorResponse;
  } finally {
    await posthog.shutdown();
  }
};

export const inviteUser = async (
  _: Response<{ email: string } | null>,
  formData: FormData,
) => {
  const session = await auth();
  const posthog = PostHogClient();
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
      posthog.capture({
        event: 'invite_user_error',
        properties: response,
        distinctId: session?.user?.id!,
      });
      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: InviteUserFormData };
    }

    posthog.capture({
      event: 'invite_user_success',
      properties: response,
      distinctId: session?.user?.id!,
    });
    return response;
  } catch (error) {
    posthog.capture({
      event: 'invite_user_error',
      properties: {
        error: error,
        message:
          error instanceof Error ? error.message : 'Something went wrong',
      },
      distinctId: session?.user?.id!,
    });
    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Something went wrong',
    } as ErrorResponse & { inputs: InviteUserFormData };
  } finally {
    await posthog.shutdown();
  }
};
