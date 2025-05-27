import customFetch from '~/lib/custom-fetch';
import { UserInterface } from '~/types/user';

export const registerUser = async (
  email: string,
  password: string,
  inviteToken: string,
) => {
  const response = await customFetch.post<UserInterface>(
    '/auth/register',
    { email, password },
    { headers: { inviteToken } },
  );

  if (!('data' in response)) {
    return {
      error: response.message,
    };
  }

  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await customFetch.post<UserInterface>(
    '/auth/login',
    { email, password },
  );

  if (!('data' in response)) {
    return {
      error: response.message,
    };
  }

  return response.data as UserInterface & { accessToken: string };
};
