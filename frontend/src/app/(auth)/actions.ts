'use server';

import {
  LoginFormData,
  RegisterFormData,
  registerFormSchema,
  loginFormSchema,
  ForgotPasswordFormData,
  forgotPasswordFormSchema,
  ResetPasswordFormData,
  resetPasswordFormSchema,
} from './schema';
import { z } from 'zod/v4';
import customFetch from '~/lib/custom-fetch';
import { UserInterface } from '~/types/user';
import { auth, signIn, signOut } from './auth';
import { collectErrorMessages } from '~/lib/utils';
import { ErrorResponse, Response, SuccessResponse } from '~/types/actions';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

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
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

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
      inviteToken ? { headers: { 'invite-token': inviteToken } } : undefined,
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
  const response = await customFetch.post<
    UserInterface & { access_token: string }
  >('/auth/login', {
    email,
    password,
  });

  if (!('data' in response)) {
    return response as ErrorResponse;
  }

  return response;
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
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

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
      redirect: true,
      redirectTo: '/',
    });

    if (!session?.user) throw new Error('Something went wrong');

    return {
      data: session?.user,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    } as SuccessResponse<UserInterface & { access_token: string }>;
  } catch (error) {
    if (isRedirectError(error)) throw error;

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
  }
};

export const forgotPasswordAction = async (
  _: Response<{ email: string } | null>,
  formData: FormData,
) => {
  let rawData: ForgotPasswordFormData | null = null;

  try {
    rawData = {
      email: formData.get('email') as string,
    };

    const validatedData = forgotPasswordFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: ForgotPasswordFormData };
    }

    const { email } = validatedData.data;

    const response = await customFetch.post<{ email: string }>(
      '/auth/forgot-password',
      { email },
    );

    if (!('data' in response)) {
      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: ForgotPasswordFormData };
    }

    return response;
  } catch (error) {
    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Something went wrong',
    } as ErrorResponse & { inputs: ForgotPasswordFormData };
  }
};

export const resetPasswordAction = async (
  _: Response<UserInterface | null>,
  formData: FormData,
) => {
  let rawData: ResetPasswordFormData | null = null;

  try {
    rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      token: formData.get('token') as string,
    };

    const validatedData = resetPasswordFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      const messages = collectErrorMessages(
        z.treeifyError(validatedData.error),
      );

      return {
        inputs: rawData,
        message: 'Invalid form data',
        timestamp: new Date().toISOString(),
        error: messages,
      } as ErrorResponse & { inputs: ResetPasswordFormData };
    }

    const { email, confirmPassword, token } = validatedData.data;

    const response = await customFetch.post<UserInterface>(
      '/auth/reset-password',
      { email, newPassword: confirmPassword, token },
    );

    if (!('data' in response)) {
      return {
        ...response,
        inputs: rawData,
      } as ErrorResponse & { inputs: ResetPasswordFormData };
    }

    return response;
  } catch (error) {
    return {
      inputs: rawData,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Something went wrong',
    } as ErrorResponse & { inputs: ResetPasswordFormData };
  }
};
export const logoutAction = async () => {
  await signOut({ redirectTo: '/login' });
};
