import { auth } from './(auth)/auth';
import PostHogClient from '~/lib/posthog';
import customFetch from '~/lib/custom-fetch';
import { StateInterface } from '~/types/state';
import { ErrorResponse, Response } from '~/types/actions';

export const getAllLocations = async (
  page: number = 1,
  limit: number = 100,
  sort: string = 'ASC',
): Promise<Response<StateInterface[]>> => {
  const session = await auth();
  const posthog = PostHogClient();
  try {
    const response = await customFetch.get<StateInterface[]>(
      `/locations?page=${page}&limit=${limit}&sort=${sort}`,
    );

    if (!('data' in response)) {
      posthog.capture({
        event: 'get_all_locations_error',
        properties: response,
        distinctId: session?.user?.id!,
      });
      throw new Error(response.message);
    }

    posthog.capture({
      event: 'get_all_locations_success',
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
