import customFetch from '~/lib/custom-fetch';
import { StateInterface } from '~/types/state';
import { ErrorResponse, Response } from '~/types/actions';
import { Phase } from '~/types/phase';

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
): Promise<Response<Phase[]>> => {
  try {
    const response = await customFetch.get<Phase[]>(
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
