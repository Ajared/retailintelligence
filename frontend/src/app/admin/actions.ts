'use server';

import { Response, SuccessResponse, ErrorResponse } from '~/types/actions';
import { UserInterface } from '~/types/user';
import customFetch from '~/lib/custom-fetch';
import { StoreInterface } from '~/types/store';

export const getAllStores = async (): Promise<Response<StoreInterface[]>> => {
  try {
    const response = await customFetch.get<StoreInterface[]>('/admin/stores');

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response as SuccessResponse<StoreInterface[]>;
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

export const getAllUsers = async (): Promise<Response<UserInterface[]>> => {
  try {
    const response = await customFetch.get<UserInterface[]>('/admin/users');

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response as SuccessResponse<UserInterface[]>;
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
    const response = await customFetch.post(`/admin/users/deactivate`, {
      userId,
    });

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response as SuccessResponse<UserInterface>;
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
    const response = await customFetch.post(`/admin/users/reactivate`, {
      userId,
    });

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    return response as SuccessResponse<UserInterface>;
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
