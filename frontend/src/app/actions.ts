import customFetch from '~/lib/custom-fetch';
import { StateInterface } from '~/types/state';
import { PhaseInterface } from '~/types/phase';
import { ErrorResponse, Response } from '~/types/actions';
import { StoreInterface } from '~/types/store';

export const getAllLocations = async (
  page: number = 1,
  limit: number = 100,
  sort: string = 'ASC',
): Promise<Response<StateInterface[]>> => {
  try {
    const response = await customFetch.get<StateInterface[]>(
      `/locations?page=${page}&limit=${limit}&sort=${sort}`,
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

export const getPhases = async (
  page: number = 1,
  limit: number = 100,
  sort: string = 'ASC',
): Promise<Response<PhaseInterface[]>> => {
  try {
    const response = await customFetch.get<PhaseInterface[]>(
      `/phases?page=${page}&limit=${limit}&sort=${sort}`,
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

export const getDashboardData = async (
  page: number = 1,
  limit: number = 20,
  sort: string = 'ASC',
): Promise<Response<StoreInterface[]>> => {
  try {
    const response = await customFetch.get<StoreInterface[]>(
      `/dashboard?page=${page}&limit=${limit}&sort=${sort}`,
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
