'use server';

import {
  LoginFormData,
  RegisterFormData,
  registerFormSchema,
  loginFormSchema,
} from './schema';
import { z } from 'zod/v4';
import { auth, signIn } from './auth';
import { redirect } from 'next/navigation';
import customFetch from '~/lib/custom-fetch';
import { UserInterface } from '~/types/user';
import { ErrorResponse, Response, SuccessResponse } from '~/types/actions';

export const registerUser = async (
  _: Response<UserInterface | null>,
  formData: FormData,
) => {
  let rawData: RegisterFormData | null = null;

  try {
    rawData = {
      email: formData.get('email') as string,
      inviteToken: formData.get('inviteToken') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const validatedData = registerFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      const messages: string[] = [];
      const tree = z.treeifyError(validatedData.error);

      function collectMessages(node: any) {
        if (Array.isArray(node?.errors)) {
          messages.push(...node.errors);
        }
        if (node?.properties && typeof node.properties === 'object') {
          Object.values(node.properties).forEach(collectMessages);
        }
      }

      collectMessages(tree);

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: RegisterFormData };
    }

    const { email, password, inviteToken } = validatedData.data;

    const response = await customFetch.post<UserInterface>(
      '/auth/register',
      { email, password },
      { headers: { 'invite-token': inviteToken } },
    );

    if (!('data' in response)) {
      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: RegisterFormData };
    }

    return response;
  } catch (error) {
    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Something went wrong',
    } as ErrorResponse & { inputs: RegisterFormData };
  }
};

export const loginUser = async (email: string, password: string) => {
  const response = await customFetch.post<UserInterface>('/auth/login', {
    email,
    password,
  });

  if (!('data' in response)) {
    return response as ErrorResponse;
  }

  return response as SuccessResponse<UserInterface & { access_token: string }>;
};

export const loginAction = async (
  _: Response<(UserInterface & { access_token: string }) | null>,
  formData: FormData,
) => {
  const session = await auth();
  let rawData: LoginFormData | null = null;

  try {
    rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validatedData = loginFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      const messages: string[] = [];
      const tree = z.treeifyError(validatedData.error);

      function collectMessages(node: any) {
        if (Array.isArray(node?.errors)) {
          messages.push(...node.errors);
        }
        if (node?.properties && typeof node.properties === 'object') {
          Object.values(node.properties).forEach(collectMessages);
        }
      }

      collectMessages(tree);

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: LoginFormData };
    }

    const { email, password } = validatedData.data;

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!session?.user) throw new Error('Something went wrong');

    return {
      data: session?.user,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    } as SuccessResponse<UserInterface & { access_token: string }>;
  } catch (error) {
    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error &&
        error.cause &&
        typeof error.cause === 'object' &&
        'err' in error.cause
          ? (error.cause.err as { message?: string }).message
          : 'Something went wrong',
    } as ErrorResponse & { inputs: LoginFormData };
  } finally {
    redirect('/');
  }
};
